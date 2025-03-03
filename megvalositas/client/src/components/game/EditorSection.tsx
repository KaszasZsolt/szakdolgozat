import React from "react";
import Editor from "@monaco-editor/react";

interface EditorSectionProps {
  config: string;
  setConfig: (value: string) => void;
  isOpen: boolean;
  toggleOpen: () => void;
}

const EditorSection: React.FC<EditorSectionProps> = ({ config, setConfig, isOpen, toggleOpen }) => (
  <section className="mb-8">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold">Játék Létrehozás</h2>
      <button
        className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
        onClick={toggleOpen}
      >
        {isOpen ? "⬆ Összecsukás" : "⬇ Kinyitás"}
      </button>
    </div>
    {isOpen && (
      <Editor
        height="300px"
        theme="vs-dark"
        defaultLanguage="json"
        value={config}
        onChange={(value) => setConfig(value || "")}
        options={{
          minimap: { enabled: false },
          wordWrap: "on",
          tabSize: 2,
          fontSize: 14
        }}
      />
    )}
  </section>
);

export default EditorSection;
