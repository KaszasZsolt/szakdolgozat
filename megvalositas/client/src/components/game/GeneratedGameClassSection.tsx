import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { generateGameClassFromConfig } from "../../utils/generateGameClass";

interface GameConfig {
  game: string;
  states: {
    [key: string]: {
      actions: { name: string; code: string }[];
      next: string | null;
    };
  };
}

interface GeneratedGameClassSectionProps {
  previewConfig: GameConfig | null;
  onCodeChange?: (code: string) => void; // Callback, ha a szülő szeretné visszakapni a módosított kódot
  initialCode?: string;
}

const GeneratedGameClassSection: React.FC<GeneratedGameClassSectionProps> = ({ previewConfig, onCodeChange, initialCode = "" }) => {
  const [generatedCode, setGeneratedCode] = useState<string>(initialCode);
  const [isEditorOpen, setEditorOpen] = useState<boolean>(true);

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
          <button
            onClick={() => setEditorOpen(!isEditorOpen)}
            className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 mb-2"
          >
            {isEditorOpen ? "Editor elrejtése" : "Editor megjelenítése"}
          </button>
          {isEditorOpen && (
            <Editor
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
                readOnly: false, // szerkeszthető
                minimap: { enabled: false },
                wordWrap: "on",
                tabSize: 2,
                fontSize: 14,
              }}
            />
          )}
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
