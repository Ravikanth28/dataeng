// Loads sql.js (SQLite compiled to WebAssembly) from a CDN so students can run
// REAL SQL in the browser. Snowflake SQL is close enough to standard SQL that
// these exercises transfer directly.

const CDN = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/";
let sqlPromise = null;

function injectScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load sql.js"));
    document.head.appendChild(s);
  });
}

// Sample dataset seeded into every fresh DB.
const SEED = `
CREATE TABLE customers (id INTEGER, name TEXT, country TEXT);
INSERT INTO customers VALUES
  (1,'Alice','US'),(2,'Bob','IN'),(3,'Carlos','UK'),(4,'Divya','IN'),(5,'Erik','US');

CREATE TABLE products (id INTEGER, name TEXT, category TEXT, price NUMBER);
INSERT INTO products VALUES
  (1,'Laptop','Electronics',1200),(2,'Phone','Electronics',800),
  (3,'Tablet','Electronics',300),(4,'Desk','Furniture',450),(5,'Chair','Furniture',150);

CREATE TABLE orders (id INTEGER, customer_id INTEGER, product TEXT, amount NUMBER, order_date TEXT);
INSERT INTO orders VALUES
  (1,1,'Laptop',1200,'2024-01-05'),(2,2,'Phone',800,'2024-01-06'),
  (3,1,'Tablet',300,'2024-01-07'),(4,3,'Laptop',1200,'2024-01-08'),
  (5,4,'Phone',800,'2024-01-09'),(6,2,'Desk',450,'2024-01-10'),
  (7,5,'Chair',150,'2024-01-11'),(8,4,'Laptop',1200,'2024-01-12'),
  (9,1,'Phone',800,'2024-01-13'),(10,3,'Tablet',300,'2024-01-14');
`;

async function getSql(onStatus = () => {}) {
  if (!sqlPromise) {
    sqlPromise = (async () => {
      onStatus("Loading SQL engine (first time only)…");
      await injectScript(`${CDN}sql-wasm.js`);
      // eslint-disable-next-line no-undef
      const SQL = await initSqlJs({ locateFile: (f) => `${CDN}${f}` });
      onStatus("Ready.");
      return SQL;
    })();
  }
  return sqlPromise;
}

// Loads a table from data ({columns, rows}) and runs SQL against it — used by
// the Project Builder's Snowflake stage to run REAL SQL on the Spark output.
export async function runSqlOnData(tableName, data, query, onStatus) {
  const SQL = await getSql(onStatus);
  const db = new SQL.Database();
  try {
    const cols = data.columns.map((c) => `"${c}"`).join(", ");
    db.run(`CREATE TABLE ${tableName} (${cols});`);
    const placeholders = data.columns.map(() => "?").join(", ");
    const stmt = db.prepare(`INSERT INTO ${tableName} VALUES (${placeholders})`);
    for (const row of data.rows) stmt.run(row);
    stmt.free();
    const results = db.exec(query);
    if (!results.length) return { ok: true, columns: [], rows: [], note: "Statement ran (no rows)." };
    const last = results[results.length - 1];
    return { ok: true, columns: last.columns, rows: last.values };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  } finally {
    db.close();
  }
}

// Runs the student's SQL against a freshly seeded DB. Returns the result of the
// LAST SELECT statement as { columns, rows }.
export async function runSql(query, onStatus) {
  const SQL = await getSql(onStatus);
  const db = new SQL.Database();
  try {
    db.run(SEED);
    const results = db.exec(query); // array of { columns, values }
    if (!results.length) return { ok: true, columns: [], rows: [], note: "Statement ran (no rows returned)." };
    const last = results[results.length - 1];
    return { ok: true, columns: last.columns, rows: last.values };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  } finally {
    db.close();
  }
}
