import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

export default function CodeEditor({ value, onChange, height = "260px" }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
      <CodeMirror
        value={value}
        height={height}
        theme={oneDark}
        extensions={[python()]}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
      />
    </div>
  );
}
