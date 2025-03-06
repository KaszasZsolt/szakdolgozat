import React from "react";
import EditorSection from "./EditorSection";
import PreviewSection from "./PreviewSection";
import MermaidCodeSection from "./MermaidCodeSection";
import DiagramSection from "./DiagramSection";
import { GameConfig } from "../../utils/GameEngine";
import CustomJsonEditor from "../custom/CustomJsonEditor";
interface BaseGameplaySectionProps {
  config: string;
  setConfig: (value: string) => void;
  previewConfig: object | null;
  mermaidCode: string;
  isEditorOpen: boolean;
  toggleEditor: () => void;
  isPreviewOpen: boolean;
  togglePreview: () => void;
  isMermaidCodeOpen: boolean;
  toggleMermaidCode: () => void;
  isDiagramOpen: boolean;
  toggleDiagram: () => void;
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
}) => {
  return (
    <section className="mb-8 border p-4 rounded border-gray-700 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Alap Játékmenet</h2>
        <button
          className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          onClick={toggleEditor}
        >
          {isEditorOpen ? "⬆ Összecsukás" : "⬇ Kinyitás"}
        </button>
      </div>
      {isEditorOpen && (
        <>
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

          {isDiagramOpen && (
            <div className="mt-4 flex-grow overflow-auto">
              <CustomJsonEditor
                config={JSON.parse(config)}
                onConfigChange={(newConfig: GameConfig) =>
                  setConfig(JSON.stringify(newConfig, null, 2))
                }
              />
            </div>
          )}

        </>
      )}
    </section>
  );
};

export default BaseGameplaySection;
