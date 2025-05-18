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
import { CardData, Hand ,TableArea, TableMode  } from "@/components/gameUi/CardUIComponents";
import PlayerSeat from '@/components/gameUi/PlayerSeat'
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
  const [hands, setHands] = useState<Record<string, CardData[]>>({});
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [tableCards, setTableCards] = useState<CardData[]>([]);
  const [tableCardMode, setTableCardMode] = useState<TableMode>("stack");
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

  const [notifications, setNotifications] = useState<
    { id: string; message: string; description?: string }[]
  >([]);

  useEffect(() => {
    if (!clientEngine) return;
    const handler = ({ message, description,playerId }: any) => {
      if(playerId && playerId !== localStorage.getItem("userId")) return
      setNotifications(n => [
        ...n,
        { id: Date.now().toString(), message, description }
      ]);
    };
    clientEngine.on("notification", handler);
    return () => clientEngine.off("notification", handler);
  }, [clientEngine]);

  useEffect(() => {
    socket.on("handsUpdate", (data: { hands: Record<string, CardData[]> }) => {
      setHands(data.hands);
    });
    socket.on(
      "handUpdate",
      (data: { playerId: string; hand: CardData[] }) => {
        setHands((prev) => ({ ...prev, [data.playerId]: data.hand }));
      }
    );
  
    return () => {
      socket.off("handsUpdate");
      socket.off("handUpdate");
    };
  }, []);


  useEffect(() => {
    // Asztali kártyák frissítése
    socket.on("tableCardsSet", (data: { cards: CardData[] }) => {
      setTableCards(data.cards);
    });
  
    return () => {
      socket.off("tableCardsSet");
    };
  }, []);

  useEffect(() => {
    // Asztali kártyák frissítése
    socket.on("tableCardMode", (data: { tableCardMode: TableMode }) => {
      setTableCardMode(data.tableCardMode);
    });
  
    return () => {
      socket.off("tableCardMode");
    };
  }, []);


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
      setGameStarted(true);
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



  const currentUserId = localStorage.getItem("userId") || "unknown";
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white px-4 pt-16">
  
      {/* Mobilra: Logs toggle */}
      <div className="fixed top-16 right-2 z-50">
        <button
          className="bg-gray-700 text-white px-3 py-1 rounded"
          onClick={() => setShowLogs((v) => !v)}
        >
          {showLogs ? "×" : "Logs"}
        </button>
      </div>
  
      {/* Logs panel */}
      <div
        className={`absolute top-16 left-0 m-4 w-80 bg-gray-900 p-4 rounded overflow-y-auto ${showLogs ? "block" : "hidden"}`}
        style={{ maxHeight: "200px" }}
      >
        <button
          className="absolute top-2 right-2 text-white text-xl"
          onClick={() => setShowLogs(false)}
        >×</button>
        <h3 className="text-lg font-bold mb-2">Játék logok:</h3>
        {logs.map((log, idx) => (
          <p key={idx} className="text-sm">
            {log}
          </p>
        ))}
      </div>
  
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
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
  
          {!gameStarted && triedRoomCode && (
            <p className="text-gray-400 text-xl text-center mb-4">A játék hamarosan kezdődik...</p>
          )}
  
          <div className="grid grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto] gap-4 sm:h-[600px] h-auto">
  
            {/* Top row */}
            <div className="col-span-3 flex justify-center flex-wrap gap-4">
              {players.slice(0, 3).map((player) => (
                <PlayerSeat
                  key={player.id}
                  name={player.id === currentUserId ? "Én" : player.email}
                  cards={hands[player.id] || []}
                  hideCards={player.id !== currentUserId}
                  onCardClick={(card, index) => {
                    return;
                    setHands(h => ({
                      ...h,
                      [player.id]: h[player.id].filter((_, i) => i !== index)
                    }));
                    setTableCards(tc => [...tc, card]);
                  }}
                />
              ))}
            </div>
  
            {/* Left side */}
            <div className="row-span-1 flex flex-col justify-center gap-4 items-end">
              {players.slice(3, 5).map((player) => (
                <PlayerSeat
                  key={player.id}
                  name={player.id === currentUserId ? "Én" : player.email}
                  cards={hands[player.id] || []}
                  hideCards={player.id !== currentUserId}
                  onCardClick={(card, index) => {
                    return;
                    setHands(h => ({
                      ...h,
                      [player.id]: h[player.id].filter((_, i) => i !== index)
                    }));
                    setTableCards(tc => [...tc, card]);
                  }}
                />
              ))}
            </div>
  
            {/* Center Table */}
            <div className="flex justify-center items-center">
              <TableArea mode={tableCardMode} cards={tableCards} width="100%" height="180px" />
            </div>
  
            {/* Right side */}
            <div className="row-span-1 flex flex-col justify-center gap-4 items-start">
              {players.slice(5, 7).map((player) => (
                <PlayerSeat
                  key={player.id}
                  name={player.id === currentUserId ? "Én" : player.email}
                  cards={hands[player.id] || []}
                  hideCards={player.id !== currentUserId}
                  onCardClick={(card, index) => {
                    return;
                    setHands(h => ({
                      ...h,
                      [player.id]: h[player.id].filter((_, i) => i !== index)
                    }));
                    setTableCards(tc => [...tc, card]);
                  }}
                />
              ))}
            </div>
  
            {/* Bottom row */}
            <div className="col-span-3 flex justify-center flex-wrap gap-4">
              {players.slice(7).map((player) => (
                <PlayerSeat
                  key={player.id}
                  name={player.id === currentUserId ? "Én" : player.email}
                  cards={hands[player.id] || []}
                  hideCards={player.id !== currentUserId}
                  onCardClick={(card, index) => {
                    return;
                    setHands(h => ({
                      ...h,
                      [player.id]: h[player.id].filter((_, i) => i !== index)
                    }));
                    setTableCards(tc => [...tc, card]);
                  }}
                />
              ))}
            </div>
          </div>
  
          {showStartButton && (
            <div className="text-center mt-4">
              <button
                onClick={handleStartGame}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
              >
                Játék indítása
              </button>
            </div>
          )}
        </div>
      )}
  
      {/* Mobil nézet kéz lent */}
      <div className="sm:hidden fixed bottom-0 left-0 w-full bg-gray-900 p-2">
        <Hand
          cards={hands[currentUserId] || []}
          hideAll={false}
          onCardClick={(c, i) => {
            return;
            console.log("Clicked card", c, i)}}
          className="overflow-x-auto"
        />
      </div>
  
      {awaitingPlayer && awaitingPlayer.id === currentUserId && (
        <SelectionPanel
          availableActions={availableActions}
          onSelect={(actionStr: string) => {
            const currentUser = {
              id: localStorage.getItem("userId") || "unknown",
              email: localStorage.getItem("email") || "unknown@example.com",
            };

            socket.emit("customSelectionMade", {
              player: currentUser,
              value: actionStr,
            });

            setAwaitingPlayer(null);
          }}
        />
      )}


  
      {isHost && engine?.isGameFinished() && (
        <button
          onClick={handleRestart}
          className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded"
        >
          Új játék indítása
        </button>
      )}
      <div
        className="
    fixed z-50 space-y-2
    
    /* mobilon lent középre */
    bottom-4 left-1/2 transform -translate-x-1/2

    /* asztalin: jobb oldal közép */
    sm:bottom-auto sm:left-auto sm:right-4 sm:top-1/2 sm:transform sm:-translate-y-1/2
  "
      >
        {notifications.map(n => (
          <div
            key={n.id}
            className="max-w-xs p-4 bg-gray-800 bg-opacity-90 text-white rounded shadow-lg"
            onAnimationEnd={() =>
              setNotifications(curr => curr.filter(x => x.id !== n.id))
            }
            style={{ animation: "fadeInOut 5s forwards" }}
          >
            <strong>{n.message}</strong>
            {n.description && <p className="mt-1 text-sm">{n.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
  
  
};

export default GamePage;
