import React from "react";
import EditorSection from "./EditorSection";
import PreviewSection from "./PreviewSection";
import MermaidCodeSection from "./MermaidCodeSection";
import DiagramSection from "./DiagramSection";
import JsonEditorSection from "./JsonEditorSection";

interface BaseGameplaySectionProps {
  config: string;
  setConfig: (value: string) => void;
  previewConfig: object | null;
  mermaidCode: string;
  // Az egyes alrészek toggle állapotai:
  isEditorOpen: boolean;
  toggleEditor: () => void;
  isPreviewOpen: boolean;
  togglePreview: () => void;
  isMermaidCodeOpen: boolean;
  toggleMermaidCode: () => void;
  isDiagramOpen: boolean;
  toggleDiagram: () => void;
  isJsonEditorOpen: boolean;
  toggleJsonEditor: () => void;
  isMainSectionOpen: boolean;
  toggleMainSectionOpen: () => void;
}

const BaseGameplaySection: React.FC<BaseGameplaySectionProps> = ({
  config,
  setConfig,
  previewConfig,
  mermaidCode,
  isEditorOpen,
  toggleEditor,
  isPreviewOpen,
  togglePreview,
  isMermaidCodeOpen,
  toggleMermaidCode,
  isDiagramOpen,
  toggleDiagram,
  isJsonEditorOpen,
  toggleJsonEditor,
  isMainSectionOpen,
  toggleMainSectionOpen,
}) => {
  return (
    <section className="mb-8 border p-4 rounded border-gray-700 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold">Alap Játékmenet</h2>
        <button
          className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          onClick={toggleMainSectionOpen}
        >
          {isMainSectionOpen ? "⬆ Összecsukás" : "⬇ Kinyitás"}
        </button>
      </div>
      {isMainSectionOpen && (
        <>
          <JsonEditorSection
            config={config}
            setConfig={setConfig}
            isOpen={isJsonEditorOpen}
            toggleOpen={toggleJsonEditor}
          />
          <EditorSection
            config={config}
            setConfig={setConfig}
            isOpen={isEditorOpen}
            toggleOpen={toggleEditor}
          />
          <PreviewSection
            previewConfig={previewConfig}
            isOpen={isPreviewOpen}
            toggleOpen={togglePreview}
          />
          <MermaidCodeSection
            mermaidCode={mermaidCode}
            isOpen={isMermaidCodeOpen}
            toggleOpen={toggleMermaidCode}
          />
          <DiagramSection
            mermaidCode={mermaidCode}
            isOpen={isDiagramOpen}
            toggleOpen={toggleDiagram}
          />
        </>
      )}
    </section>
  );
};

export default BaseGameplaySection;
