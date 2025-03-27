import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GameEngine, GameConfig } from "../utils/GameEngine";
import { transpileInBrowser } from "../utils/transpile";
import { joinGameRoom } from "../services/roomService";
import { useGameSession } from "../hooks/useGameSession";

const GamePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlRoomCode = searchParams.get("roomCode");

  const [inputCode, setInputCode] = useState<string>("");
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { setGameSession } = useGameSession();
  const [triedRoomCode, setTriedRoomCode] = useState<string | null>(urlRoomCode);

  const loadGameFromRoom = useCallback(async (roomCode: string) => {
    try {
      const roomData = await joinGameRoom(roomCode);
      if (!roomData?.gameConfig) {
        throw new Error("A megadott szoba nem található.");
      }

      const parsed = typeof roomData.gameConfig === "string"
        ? JSON.parse(roomData.gameConfig)
        : roomData.gameConfig;

      if (!parsed?.config || !parsed?.code) {
        throw new Error("A szoba konfigurációja hibás.");
      }

      const config: GameConfig = parsed.config;
      const jsCode = await transpileInBrowser(parsed.code);
      eval(jsCode);
      const gameEngine = new GameEngine(config);
      setEngine(gameEngine);
      setGameSession({ gameName: config?.game || "Játék", roomCode, isHost: true });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Ismeretlen hiba történt.");
      setTriedRoomCode(null);
    } finally {
      setLoading(false);
    }
  }, [setGameSession]);

  useEffect(() => {
    if (triedRoomCode) {
      loadGameFromRoom(triedRoomCode);
    } else {
      setLoading(false);
    }
  }, [triedRoomCode, loadGameFromRoom]);

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    navigate(`/game?roomCode=${inputCode}`, { replace: true });
    setTriedRoomCode(inputCode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4">
      {loading ? (
        <p className="text-center text-lg">Betöltés...</p>
      ) : !triedRoomCode || !engine ? (
        <div className="text-center">
          <p className="mb-2">Kérjük, add meg a szoba kódját:</p>
          <form onSubmit={handleSubmitCode} className="flex flex-col items-center gap-3">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="4 számjegyű kód"
              className="border border-gray-400 rounded px-3 py-2 w-full max-w-xs bg-gray-800 text-white"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Csatlakozás
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </form>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-400 text-xl">A játék hamarosan kezdődik...</p>
        </div>
      )}
    </div>
  );
};

export default GamePage;
