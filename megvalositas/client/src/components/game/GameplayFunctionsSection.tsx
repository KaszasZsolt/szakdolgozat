import React from "react";
import GeneratedGameClassSection from "./GeneratedGameClassSection";
import { transpileInBrowser } from "../../utils/transpile";
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
  const handleStartGame = async () => {
    if (!previewConfig) {
      alert("Először generálja a konfigurációt!");
      return;
    }
    try {
      (window as any).GameEngine = GameEngine;
      const jsCode = await transpileInBrowser(generatedCode);
      eval(jsCode);

      const className = previewConfig.game.replace(/\s+/g, "");
      if (!(window as any)[className]) {
        throw new Error(`A ${className} osztály nem regisztrálódott a globális scope-ban.`);
      }

      const engineInstance = new GameEngine(previewConfig);
      setEngine(engineInstance);
      alert("Sikeres fordítás, betöltés és játék indítása!");
      engineInstance.startGame();
    } catch (err: unknown) {
      console.error("Hiba a játék indításakor:", err);
      alert("Hiba történt a játék indítása során: " + (err instanceof Error ? err.message : err));
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
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={handleStartGame}
          >
            Játék tesztelése
          </button>
        </div>
      </div>
    </section>
  );
};

export default GameplayFunctionsSection;
