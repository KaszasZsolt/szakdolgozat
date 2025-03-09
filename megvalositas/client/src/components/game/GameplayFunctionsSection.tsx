import React from "react";
import GeneratedGameClassSection from "./GeneratedGameClassSection";
import CompileAndLoadButton from "./CompileAndLoadButton";
import { GameEngine, GameConfig } from "../../utils/GameEngine";

interface GameplayFunctionsSectionProps {
  previewConfig: GameConfig | null;
  generatedCode: string;
  setGeneratedCode: (code: string) => void;
  setEngine: (engine: GameEngine | null) => void;
}

const GameplayFunctionsSection: React.FC<GameplayFunctionsSectionProps> = ({
  previewConfig,
  generatedCode,
  setGeneratedCode,
  setEngine,
}) => {
  const handleStartGame = () => {
    if (previewConfig) {
      try {
        const engineInstance = new GameEngine(previewConfig);
        setEngine(engineInstance);
        alert("Játék sikeresen betöltve és elindítva!");
      } catch (err: unknown) {
        console.error("Hiba a játék indításakor:", err);
        alert("Hiba történt a játék indítása során!");
      }
    } else {
      alert("Először generálja a konfigurációt!");
    }
  };

  return (
    <section className="mb-8 border p-4 rounded border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Játék Funkciók</h2>
      </div>
      <div className="mt-4">
        <GeneratedGameClassSection
          previewConfig={previewConfig}
          onCodeChange={setGeneratedCode}
          initialCode={generatedCode}
        />

        <CompileAndLoadButton
          tsCode={generatedCode}
          className={previewConfig ? previewConfig.game.replace(/\s+/g, "") : ""}
          onSuccess={() => {
            if (previewConfig) {
              const className = previewConfig.game.replace(/\s+/g, "");
              if (!(window as any)[className]) {
                alert("A generált osztály még mindig nem található a window objektumban.");
              }
            }
          }}
        />

        <div className="mt-4">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={handleStartGame}
          >
            Játék indítása
          </button>
        </div>
      </div>
    </section>
  );
};

export default GameplayFunctionsSection;
