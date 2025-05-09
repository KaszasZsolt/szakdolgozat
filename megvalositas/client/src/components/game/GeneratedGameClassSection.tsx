import React, { useState, useEffect } from "react";
import Editor, { DiffEditor, useMonaco, Monaco } from "@monaco-editor/react";
import { generateGameClassFromConfig } from "../../utils/generateGameClass";
import { GameConfig } from "../../utils/GameEngine";
import generatedGameBaseDts from '@/utils/GeneratedGameBase.d.ts?raw';

interface GeneratedGameClassSectionProps {
  previewConfig: GameConfig | null;
  onCodeChange?: (code: string) => void;
  initialCode?: string;
}

const GeneratedGameClassSection: React.FC<GeneratedGameClassSectionProps> = ({
  previewConfig,
  onCodeChange,
  initialCode = ""
}) => {
  const [generatedCode, setGeneratedCode] = useState<string>(initialCode);
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const monacoRef = React.useRef<Monaco | null>(null);
  const monaco = useMonaco();
  useEffect(() => {
    if (monaco) monacoRef.current = monaco;
  }, [monaco]);
  useEffect(() => {
    return () => {
      monacoRef.current?.editor.getModels().forEach(m => m.dispose());
    };
  }, []);

  const handleGenerateClick = () => {
    if (!previewConfig) {
      alert("Nincs betöltött konfiguráció, előbb generálj előnézetet!");
      return;
    }
    const code = generateGameClassFromConfig(previewConfig);
    setGeneratedCode(code);
    setShowDiff(true);
  };

  const applyDiff = () => {
    if (onCodeChange) onCodeChange(generatedCode);
    setShowDiff(false);
  };

  useEffect(() => {
    setGeneratedCode(initialCode);
  }, [initialCode]);

  const handleEditorWillMount = (monaco: any) => {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      generatedGameBaseDts,
      "ts:filename/GeneratedGameBase.d.ts"
    );
  };

  return (
    <section className="mb-8 border p-4 rounded border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Generált Játék Class</h2>
        <button
          className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          onClick={handleGenerateClick}
        >
          Alap Kód generálása
        </button>
      </div>

      {showDiff ? (
        <div className="mt-4">
          <DiffEditor
            key={`diff-${generatedCode.length}`}
            height="400px"
            language="typescript"
            original={initialCode}
            modified={generatedCode}
            originalModelPath="inmemory://diff/original.ts"
            modifiedModelPath="inmemory://diff/modified.ts"
            keepCurrentOriginalModel                     
            keepCurrentModifiedModel
            options={{                                   
              renderSideBySide: true,
              minimap: { enabled: false },
            }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-500"
              onClick={applyDiff}
            >
              Változások alkalmazása
            </button>
            <button
              className="px-4 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
              onClick={() => setShowDiff(false)}
            >
              Mégse
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Editor
            beforeMount={handleEditorWillMount}
            height="300px"
            theme="vs-dark"
            defaultLanguage="typescript"
            value={generatedCode}
            onChange={(value) => {
              const newCode = value || "";
              setGeneratedCode(newCode);
              if (onCodeChange) onCodeChange(newCode);
            }}
            options={{
              readOnly: false,
              minimap: { enabled: false },
              wordWrap: "on",
              tabSize: 2,
              fontSize: 14,
            }}
          />
        </div>
      )}
    </section>
  );
};

export default GeneratedGameClassSection;
