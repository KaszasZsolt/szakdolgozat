// GamePage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GameEngine, GameConfig } from "../utils/GameEngine";
import { transpileInBrowser } from "../utils/transpile";
import { joinGameRoom } from "../services/roomService";
import { useGameSession } from "../hooks/useGameSession";
import { io } from "socket.io-client";
import { SelectionPanel } from "../components/gameUi/SelectionPanelProps";
import { GameEngineClient } from "../utils/GameEngineClient";
import { API_BASE_URL } from "../config/config";

// Socket kapcsolat létrehozása
const socket = io(API_BASE_URL, { withCredentials: true });

const GamePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlRoomCode = searchParams.get("roomCode");

  const [inputCode, setInputCode] = useState<string>("");
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [clientEngine, setClientEngine] = useState<GameEngineClient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { setGameSession } = useGameSession();
  const [triedRoomCode, setTriedRoomCode] = useState<string | null>(urlRoomCode);
  const [showStartButton, setShowStartButton] = useState<boolean | null>(null);
  const [players, setPlayers] = useState<{ id: string; email: string }[]>([]);
  // Az isHost értékét a roomData alapján állítjuk be
  const [isHost, setIsHost] = useState<boolean>(false);
  const [awaitingPlayer, setAwaitingPlayer] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  const loadGameFromRoom = useCallback(async (roomCode: string) => {
    try {
      const roomData: { gameConfig: string; host: string; players: any[] } = await joinGameRoom(roomCode);
      if (!roomData?.gameConfig) {
        throw new Error("A megadott szoba nem található.");
      }
      const currentUserId = localStorage.getItem("userId") || "unknown";

      setIsHost(!!roomData.host && String(roomData.host) === currentUserId);

      const parsed = typeof roomData.gameConfig === "string"
        ? JSON.parse(roomData.gameConfig)
        : roomData.gameConfig;
      if (!parsed?.config || !parsed?.code) {
        throw new Error("A szoba konfigurációja hibás.");
      }

      const config: GameConfig = parsed.config;
      const jsCode = await transpileInBrowser(parsed.code);
      eval(jsCode);

      if (isHost) {
        const gameEngine = new GameEngine(config, socket);
        gameEngine.setPlayers(roomData.players);
        setEngine(gameEngine);
        const client = new GameEngineClient(socket);
        setClientEngine(client);
      } else {
        const client = new GameEngineClient(socket);
        setClientEngine(client);

      }
      setGameSession({ gameName: config?.game || "Játék", roomCode, isHost: isHost });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Ismeretlen hiba történt.");
      setTriedRoomCode(null);
    } finally {
      setLoading(false);
    }
  }, [setGameSession, isHost]);

  useEffect(() => {
    if (engine) {
      const handleEngineLog = (message: string) => {
        setLogs((prevLogs) => [...prevLogs, `ENGINE: ${message}`]);
      };
      engine.on("log", handleEngineLog);
      return () => {
        engine.off("log", handleEngineLog);
      };
    }
  }, [engine]);
  // Feliratkozás az "awaitSelection" eseményre (host esetében)
  useEffect(() => {
    if (!clientEngine) return;

    const handleAwaitSelection = (data: any) => {
      const currentUserId = localStorage.getItem("userId");
      if (data.player.id === currentUserId) {
        setAvailableActions(data.availableActions || []);
        setAwaitingPlayer(data.player);
      } else {
        setAwaitingPlayer(null);
      }
      setLogs((prevLogs) => [...prevLogs, `AWAIT SELECTION: ${JSON.stringify(data)}`]);
    };

    clientEngine.on("awaitSelection", handleAwaitSelection);

    return () => {
      clientEngine.off("awaitSelection", handleAwaitSelection);
    };
  }, [clientEngine]);

  useEffect(() => {
    if (!clientEngine) return;
    clientEngine.on("resetGame", () => {
      loadGameFromRoom(triedRoomCode || "");
    });
  });

  useEffect(() => {
    setShowStartButton(isHost && engine && !engine.isGameStarted());
  }, [isHost, engine]);

  const handleRestart = () => {
    if (!isHost || !engine) return;
      socket.emit("resetGame", { roomCode: triedRoomCode });
      loadGameFromRoom(triedRoomCode || "");
  };

  useEffect(() => {
    if (triedRoomCode) {
      loadGameFromRoom(triedRoomCode);
    } else {
      setLoading(false);
    }
  }, [triedRoomCode, loadGameFromRoom]);

  // Csatlakozás a szobához a socket-en keresztül
  useEffect(() => {
    if (triedRoomCode) {
      const currentUser = {
        id: localStorage.getItem("userId") || "unknown",
        email: localStorage.getItem("email") || "unknown@example.com"
      };
      socket.emit("joinRoom", { roomCode: triedRoomCode, user: currentUser });
    }
  }, [triedRoomCode]);

  // Játékoslista frissítése
  useEffect(() => {
    const handleUpdatePlayers = (updatedPlayers: { id: string; email: string }[]) => {
      setPlayers(updatedPlayers);
      if (isHost && engine) {
        engine.setPlayers(updatedPlayers);
      }
    };
    socket.on("updatePlayers", handleUpdatePlayers);

    return () => {
      socket.off("updatePlayers", handleUpdatePlayers);
    };
  }, [engine, isHost]);
  useEffect(() => {
    if (!clientEngine) return;

    // Eseménykezelő függvények, melyek a változásokat a 'logs' state-be mentik
    const handleLog = (message: string) => {
      setLogs((prevLogs) => [...prevLogs, `LOG: ${message}`]);
    };

    const handleStateChanged = (state: string) => {
      setLogs((prevLogs) => [...prevLogs, `STATE CHANGED: ${state}`]);
    };

    const handleActionSelected = (data: any) => {
      setLogs((prevLogs) => [...prevLogs, `ACTION SELECTED: ${JSON.stringify(data)}`]);
    };

    const handleActionExecuted = (data: any) => {
      setLogs((prevLogs) => [...prevLogs, `ACTION EXECUTED: ${JSON.stringify(data)}`]);
    };

    const handleStepCompleted = (data: any) => {
      setLogs((prevLogs) => [...prevLogs, `STEP COMPLETED: ${JSON.stringify(data)}`]);
    };

    const handleGameStarted = (data: any) => {
      setLogs((prevLogs) => [...prevLogs, `GAME STARTED: ${JSON.stringify(data)}`]);
    };

    // Események feliratkozása
    clientEngine.on("log", handleLog);
    clientEngine.on("stateChanged", handleStateChanged);
    clientEngine.on("actionSelected", handleActionSelected);
    clientEngine.on("actionExecuted", handleActionExecuted);
    clientEngine.on("stepCompleted", handleStepCompleted);
    clientEngine.on("gameStarted", handleGameStarted);

    // Cleanup: amikor a komponens unmountolódik, leiratkozunk az eseményekről
    return () => {
      clientEngine.off("log", handleLog);
      clientEngine.off("stateChanged", handleStateChanged);
      clientEngine.off("actionSelected", handleActionSelected);
      clientEngine.off("actionExecuted", handleActionExecuted);
      clientEngine.off("stepCompleted", handleStepCompleted);
      clientEngine.off("gameStarted", handleGameStarted);
    };
  }, [clientEngine]);


  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    navigate(`/game?roomCode=${inputCode}`, { replace: true });
    setTriedRoomCode(inputCode);
  };

  // Ha a felhasználó host, akkor a "Játék indítása" gomb látszik, és az indítja a host GameEngine-t
  const handleStartGame = () => {
    if (engine) {
      engine.startGame();
      setShowStartButton(isHost && engine && !engine.isGameStarted())
    }
  };


  // Játékosok kördiagramként történő megjelenítése:
  const getPlayerStyle = (index: number, total: number): React.CSSProperties => {
    const angle = (2 * Math.PI * index) / total;
    const radius = 120; // módosítható, ha szükséges
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return {
      position: "absolute",
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: "translate(-50%, -50%)",
      padding: "6px 12px",
      backgroundColor: "#2d3748",
      borderRadius: "9999px",
      border: "1px solid #4a5568",
      fontSize: "0.75rem"
    };
  };
  const currentUserId = localStorage.getItem("userId") || "unknown";
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
      {loading ? (
        <p className="text-center text-lg">Betöltés...</p>
      ) : !triedRoomCode || (!engine && !clientEngine) ? (
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
        <div className="text-center relative">
          <p className="text-gray-400 text-xl">A játék hamarosan kezdődik...</p>
          {/* Játékosok megjelenítése kördiagramként */}
          <div className="relative mt-6 w-80 h-80 mx-auto">
            {players.map((player, index) => (
              <div key={index} style={getPlayerStyle(index, players.length)}>
                {player.email}
              </div>
            ))}
          </div>
          {/* Csak hostnál jelenik meg a start gomb, ha a játék még Setup állapotban van */}
          {showStartButton && (
            <button
              onClick={handleStartGame}
              className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Játék indítása
            </button>
          )}
        </div>
      )}
      {/* Megjelenítjük a log üzeneteket */}
      <div
        className="mt-6 w-full max-w-lg bg-gray-900 p-4 rounded overflow-y-auto"
        style={{ maxHeight: "200px" }}
      >
        <h3 className="text-lg font-bold mb-2">Játék logok:</h3>
        {logs.map((log, idx) => (
          <p key={idx} className="text-sm">
            {log}
          </p>
        ))}
      </div>
      {awaitingPlayer && awaitingPlayer.id === currentUserId && (
        <SelectionPanel
          availableActions={availableActions}
          onSelect={(action: string) => {
            if (isHost && engine) {
              engine.setSelectedAction(action);
            } else if (clientEngine) {
              const currentUser = {
                id: localStorage.getItem("userId") || "unknown",
                email: localStorage.getItem("email") || "unknown@example.com"
              };
              clientEngine.setSelectedAction(action, currentUser);
            }
            setAwaitingPlayer(null);
          }}
        />
      )}
      {isHost && engine?.isGameFinished() && (
        <button
          onClick={handleRestart}
          className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded">
          Új játék indítása
        </button>
      )}
    </div>
  );
};

export default GamePage;
