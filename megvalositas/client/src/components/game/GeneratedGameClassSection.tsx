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
  const [fontSize, setFontSize] = useState<number>(14);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
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
  if (!monacoRef.current || !monacoRef.current.editor) return;
  const modifiedModel = monacoRef.current.editor.getModel(
    monacoRef.current.Uri.parse('inmemory://diff/modified.ts')
  );
  if (!modifiedModel) return;
  const mergedCode = modifiedModel.getValue();

  setGeneratedCode(mergedCode);
  if (onCodeChange) onCodeChange(mergedCode);

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

  const enlarge = () => setFontSize(fs => Math.min(fs + 2, 32));
  const shrink = () => setFontSize(fs => Math.max(fs - 2, 8));
  const toggleFullscreen = () => setIsFullscreen(f => !f);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  const containerClass = isFullscreen
    ? 'fixed inset-0 bg-gray-900 z-50 flex flex-col p-4'
    : '';

  const editorHeight = isFullscreen ? '100%' : showDiff ? '400px' : '300px';

  return (
    <section className={`${containerClass} mb-8 border p-4 rounded border-gray-700 bg-gray-800`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-white">Generált Játék Class</h2>
        <button
          className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          onClick={handleGenerateClick}
        >
          Alap Kód generálása
        </button>
      </div>

      <div className="flex justify-between items-center bg-gray-700 p-2 rounded mb-2">
        <div className="flex gap-2">
          <button
            onClick={shrink}
            className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Kicsinyítés
          </button>
          <button
            onClick={enlarge}
            className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Nagyítás
          </button>
        </div>
        <div className="flex gap-2">
          {showDiff && (
            <button
              onClick={applyDiff}
              className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500"
            >
              Alkalmaz
            </button>
          )}
          {showDiff && (
            <button
              onClick={() => {
              setGeneratedCode(initialCode);
              setShowDiff(false);
            }}
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
            >
              Mégse
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            {isFullscreen ? '⤫' : '⤢'}
          </button>
        </div>
      </div>

      <div className="flex-1">
        {showDiff ? (
          <DiffEditor
            height={editorHeight}
            language="typescript"
            original={initialCode}
            modified={generatedCode}
            originalModelPath="inmemory://diff/original.ts"
            modifiedModelPath="inmemory://diff/modified.ts"
            options={{
              renderSideBySide: true,
              minimap: { enabled: false },
              fontSize,
            }}
          />
        ) : (
          <Editor
            beforeMount={handleEditorWillMount}
            height={editorHeight}
            theme="vs-dark"
            defaultLanguage="typescript"
            value={generatedCode}
            onChange={value => {
              const newCode = value || '';
              setGeneratedCode(newCode);
              if (onCodeChange) onCodeChange(newCode);
            }}
            options={{
              readOnly: false,
              minimap: { enabled: false },
              wordWrap: 'on',
              tabSize: 2,
              fontSize,
            }}
          />
        )}
      </div>
    </section>
  );
};

export default GeneratedGameClassSection;