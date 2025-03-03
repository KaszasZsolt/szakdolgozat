import React from "react";

interface MermaidCodeSectionProps {
  mermaidCode: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

const MermaidCodeSection: React.FC<MermaidCodeSectionProps> = ({ mermaidCode, isOpen, toggleOpen }) => {
  if (!mermaidCode) return null;
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Mermaid Setup</h2>
        <button
          className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          onClick={toggleOpen}
        >
          {isOpen ? "⬆ Összecsukás" : "⬇ Kinyitás"}
        </button>
      </div>
      {isOpen && (
        <pre className="bg-gray-800 p-4 rounded overflow-auto text-sm font-mono text-white">
          {mermaidCode}
        </pre>
      )}
    </section>
  );
};

export default MermaidCodeSection;
