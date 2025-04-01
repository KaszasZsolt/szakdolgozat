import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GameEngine, GameConfig } from "../utils/GameEngine";
import { transpileInBrowser } from "../utils/transpile";
import { joinGameRoom } from "../services/roomService";
import { useGameSession } from "../hooks/useGameSession";
import { io } from "socket.io-client";

const socket = io("http://localhost:31112", { withCredentials: true });

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
  
  const [players, setPlayers] = useState<{ id: string; email: string }[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);

  const loadGameFromRoom = useCallback(async (roomCode: string) => {
    try {
      const roomData: {  gameConfig: string; host: string; players: any[]  } = await joinGameRoom(roomCode);
      if (!roomData?.gameConfig) {
        throw new Error("A megadott szoba nem található.");
      }
  
      const currentUserId = localStorage.getItem("userId") || "unknown";
      if (roomData.host && String(roomData.host) === currentUserId) {
        setIsHost(true);
      } else {
        setIsHost(false);
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
      setGameSession({ gameName: config?.game || "Játék", roomCode, isHost });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Ismeretlen hiba történt.");
      setTriedRoomCode(null);
    } finally {
      setLoading(false);
    }
  }, [setGameSession, isHost]);
  
  

  useEffect(() => {
    if (triedRoomCode) {
      loadGameFromRoom(triedRoomCode);
    } else {
      setLoading(false);
    }
  }, [triedRoomCode, loadGameFromRoom]);

  useEffect(() => {
    if (triedRoomCode) {
      const currentUser = {
        id: localStorage.getItem("userId") || "unknown",
        email: localStorage.getItem("email") || "unknown@example.com"
      };
      socket.emit("joinRoom", { roomCode: triedRoomCode, user: currentUser });
    }
  }, [triedRoomCode]);

  useEffect(() => {
    const handleUpdatePlayers = (updatedPlayers: { id: string; email: string }[]) => {
      setPlayers(updatedPlayers);
    };
    socket.on("updatePlayers", handleUpdatePlayers);
    return () => {
      socket.off("updatePlayers", handleUpdatePlayers);
    };
  }, []);

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    navigate(`/game?roomCode=${inputCode}`, { replace: true });
    setTriedRoomCode(inputCode);
  };

  // A host számára megjelenő indító gomb eseménykezelője:
  const handleStartGame = () => {
    // Itt indíthatod el a játékot, például egy socket esemény küldésével:
    socket.emit("startGame", { roomCode: triedRoomCode });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
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
          <div className="mt-4">
            <h2 className="text-lg font-bold">Játékosok:</h2>
            <ul>
              {players.map((player, index) => (
                <li key={index}>
                  {player.email} {player.id !== "unknown" ? `(${player.id})` : ""}
                </li>
              ))}
            </ul>
          </div>
          {/* Csak a host számára jelenjen meg az indító gomb */}
          {isHost && (
            <button
              onClick={handleStartGame}
              className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Játék indítása
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GamePage;
