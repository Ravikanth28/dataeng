// Lazily loads Pyodide (real Python in the browser) from a CDN, only when
// the student first runs Python code — so it doesn't slow the initial page.

const PYODIDE_VERSION = "0.26.4";
const CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise = null;

function injectScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load Pyodide"));
    document.head.appendChild(s);
  });
}

export function loadPyodideOnce(onStatus = () => {}) {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    onStatus("Downloading Python runtime (first time only)…");
    await injectScript(`${CDN}pyodide.js`);
    // eslint-disable-next-line no-undef
    const pyodide = await loadPyodide({ indexURL: CDN });
    onStatus("Loading pandas…");
    await pyodide.loadPackage(["pandas"]);
    // Quiet the noisy pyarrow/pandas deprecation warnings in student output.
    await pyodide.runPythonAsync("import warnings; warnings.simplefilter('ignore')");
    onStatus("Ready.");
    return pyodide;
  })();

  return pyodidePromise;
}

// Runs Python and captures stdout/stderr as a string.
export async function runPython(code, onStatus) {
  const pyodide = await loadPyodideOnce(onStatus);
  let output = "";
  pyodide.setStdout({ batched: (s) => (output += s + "\n") });
  pyodide.setStderr({ batched: (s) => (output += s + "\n") });
  try {
    await pyodide.runPythonAsync(code);
    // If the student's code defines a DataFrame named `result`, extract it so
    // the UI can show a table + animated chart.
    let table = null;
    try {
      await pyodide.runPythonAsync(`
try:
    import json as _json, pandas as _pd
    _df = None
    # Prefer a DataFrame explicitly named 'result'…
    if 'result' in globals() and isinstance(globals()['result'], _pd.DataFrame):
        _df = globals()['result']
    else:
        # …otherwise fall back to the last DataFrame the code defined.
        for _k, _v in list(globals().items()):
            if not _k.startswith('_') and _k != 'orders' and isinstance(_v, _pd.DataFrame):
                _df = _v
    if _df is not None and len(_df) > 0:
        _d = _df.head(20)
        __table__ = _json.dumps({
            "columns": [str(c) for c in _d.columns],
            "rows": _d.astype(object).where(_d.notna(), None).values.tolist()
        })
    else:
        __table__ = None
except Exception:
    __table__ = None
`);
      const t = pyodide.globals.get("__table__");
      if (t) table = JSON.parse(t);
    } catch {
      table = null;
    }
    return { ok: true, output, table };
  } catch (e) {
    return { ok: false, output: output + "\n" + String(e.message || e) };
  }
}
