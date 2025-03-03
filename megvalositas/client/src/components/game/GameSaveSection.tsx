import React from "react";
import { GameConfig } from "../../utils/GameEngine";
import { createGame, updateGame } from "../../services/gameService";

interface GameSaveSectionProps {
  previewConfig: GameConfig | null;
  generatedCode: string;
  gameId: string | null;
  setGameId: (id: string) => void;
}

const GameSaveSection: React.FC<GameSaveSectionProps> = ({
  previewConfig,
  generatedCode,
  gameId,
  setGameId,
}) => {
  const handleCreateNewGameWithCode = async () => {
    if (!previewConfig) {
      alert("Nincs előnézet konfiguráció, előbb generálja!");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Nem vagy bejelentkezve!");
      return;
    }
    const merged = { config: previewConfig, code: generatedCode };

    try {
      const data = await createGame(token, previewConfig.game || "Ismeretlen játék", merged);
      if (data.id) {
        setGameId(data.id);
      } else {
        console.warn("Nem érkezett id a válaszból:", data);
      }
      alert("Új játék és kód sikeresen mentve!");
    } catch (err: unknown) {
      console.error("Hiba a mentés során:", err);
      alert(err instanceof Error ? err.message : "Ismeretlen hiba történt.");
    }
  };

  const handleUpdateExistingGameCode = async () => {
    if (!previewConfig) {
      alert("Nincs előnézet konfiguráció, előbb generálja!");
      return;
    }
    if (!gameId) {
      alert("Nincs gameId, nem tudom frissíteni a játékot!");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Nem vagy bejelentkezve!");
      return;
    }
    const merged = { config: previewConfig, code: generatedCode };

    try {
      await updateGame(token, gameId, merged);
      alert("Meglévő játék frissítve a kóddal!");
    } catch (err: unknown) {
      console.error("Hiba a frissítés során:", err);
      alert(err instanceof Error ? err.message : "Ismeretlen hiba történt.");
    }
  };

  return (
    <div className="mt-4 flex flex-row gap-4">
      <button
        className={`px-4 py-2 text-white rounded hover:bg-${
          gameId ? "green-600" : "blue-600"
        } bg-${gameId ? "green-500" : "blue-500"}`}
        onClick={gameId ? handleUpdateExistingGameCode : handleCreateNewGameWithCode}
      >
        {gameId ? "Meglévő játék frissítése kóddal" : "Új játék mentése"}
      </button>
    </div>
  );
};

export default GameSaveSection;
