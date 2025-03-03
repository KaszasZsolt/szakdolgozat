import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface DiagramSectionProps {
  mermaidCode: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

const DiagramSection: React.FC<DiagramSectionProps> = ({ mermaidCode, isOpen, toggleOpen }) => {
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && mermaidCode && diagramRef.current) {
      diagramRef.current.innerHTML = "";
      mermaid
        .render("mermaidDiagram", mermaidCode)
        .then(({ svg }) => {
          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
          }
        })
        .catch((err) => {
          console.error("Mermaid render hiba:", err);
        });
    }
  }, [isOpen, mermaidCode]);

  if (!mermaidCode) return null;
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Mermaid Diagram</h2>
        <button
          className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          onClick={toggleOpen}
        >
          {isOpen ? "⬆ Összecsukás" : "⬇ Kinyitás"}
        </button>
      </div>
      {isOpen && <div ref={diagramRef} className="bg-gray-800 p-4 rounded overflow-auto" />}
    </section>
  );
};

export default DiagramSection;
