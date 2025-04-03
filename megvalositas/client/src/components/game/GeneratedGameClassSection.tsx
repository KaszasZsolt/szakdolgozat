import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { generateGameClassFromConfig } from "../../utils/generateGameClass";
import { GameConfig } from "../../utils/GameEngine";

const generatedGameBaseDts = `
/**
 * A GeneratedGameBase osztály, amely az általános funkciókat tartalmazza.
 */
declare class GeneratedGameBase {
  /**
   * A játékot a következő játékosra lépteti a megadott irányban.
   * @param direction Az irány, amelyben a következő játékosra lépünk. Alapértelmezett: 'forward'.
   */
  nextPlayer(direction?: 'forward' | 'backward'): void;
}
`;


interface GeneratedGameClassSectionProps {
  previewConfig: GameConfig | null;
  onCodeChange?: (code: string) => void; // Callback, ha a szülő szeretné visszakapni a módosított kódot
  initialCode?: string;
}

const GeneratedGameClassSection: React.FC<GeneratedGameClassSectionProps> = ({
  previewConfig,
  onCodeChange,
  initialCode = ""
}) => {
  const [generatedCode, setGeneratedCode] = useState<string>(initialCode);

  // Ha nincs initialCode, és a felhasználó rákattint a "Kód generálása" gombra,
  // akkor generáljuk a kódot.
  const handleGenerateClick = () => {
    if (!previewConfig) {
      alert("Nincs betöltött konfiguráció, előbb generálj előnézetet!");
      return;
    }
    const code = generateGameClassFromConfig(previewConfig);
    setGeneratedCode(code);
    if (onCodeChange) {
      onCodeChange(code);
    }
  };

  // Ha a szülő által megadott initialCode változik (pl. komponens mountolásakor),
  // frissítsük a helyi állapotot.
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
      {generatedCode ? (
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
              if (onCodeChange) {
                onCodeChange(newCode);
              }
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
      ) : (
        <p className="mt-4">
          A generált kód itt jelenik meg, miután rákattintottál a "Kód generálása" gombra.
        </p>
      )}
    </section>
  );
};

export default GeneratedGameClassSection;
