import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData, fetchGames, createGame, deleteGame, Game } from "../services/dashboardService";
import { createGameRoom } from "../services/roomService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{ email: string } | null>(null);
  const [error, setError] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [newGameName, setNewGameName] = useState("");

  // Token ellenőrzése és felhasználói adat lekérése
  useEffect(() => {
    getUserData()
      .then(data => setUserData(data))
      .catch((err: Error) => setError(err.message));
  }, [navigate]);

  // Játékok lekérése a szervertől
  const loadGames = () => {
    fetchGames()
      .then(gamesList => setGames(gamesList))
      .catch((err: Error) => setError(err.message));
  };

  useEffect(() => {
    loadGames();
  }, []);

  // Új játék létrehozása
  const handleCreateGame = () => {
    if (!newGameName.trim()) {
      setError("Kérlek adj meg egy játék nevet!");
      return;
    }
    createGame(newGameName)
      .then(() => {
        setNewGameName("");
        loadGames();
      })
      .catch((err: Error) => setError(err.message));
  };
  const [roomCodes, setRoomCodes] = useState<Record<string, string>>({});
  const handleCreateRoom = async (gameId: string) => {
    try {
      const room = await createGameRoom({ gameId });
      setRoomCodes((prev) => ({ ...prev, [gameId]: room.code }));
    } catch (error: any) {
      alert("Hiba a szoba létrehozásakor: " + error.message);
    }
  };
  // Játék törlése
  const handleDeleteGame = (game: Game) => {
    const confirmationText = "TÖRÖLNI";
    const userInput = window.prompt(
      `Biztosan törölni akarod a játékot "${game.name}"? Kérlek írd be a "${confirmationText}" szót a törlés megerősítéséhez:`
    );
    if (userInput !== confirmationText) {
      alert("A törlés nem történt meg, mert a megerősítő szöveg nem egyezett.");
      return;
    }
    deleteGame(game.id)
      .then(() => {
        alert("Játék sikeresen törölve!");
        loadGames();
      })
      .catch((err: Error) => setError(err.message));
  };

  // Játék szerkesztése: navigálás a /gamecreationpage oldalra a mentett konfigurációval (ha van)
  const handleEditGame = (game: Game) => {
    navigate("/gamecreationpage", {
      state: {
        config: game.config,
        gameName: game.name,
        gameId: game.id,
      },
    });
  };

  // Segédfüggvény a megjelenítendő játék név meghatározásához
  const getDisplayName = (game: Game): string => {
    let displayName = game.name;
    try {
      const parsed = JSON.parse(game.config || "");
      displayName = parsed?.config?.game || displayName;
    } catch (error) {
      console.error("Hibás JSON formátum a game.config-ban:", error);
    }
    return displayName;
  };

  return (
    <div className="lg:px-[22vw] md:px-20 px-8 pt-[12vh] pb-[4vh] text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Főoldal</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {userData ? (
        <div className="text-center">
          <p className="mb-4">Üdvözlünk, {userData.email}!</p>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Játék Létrehozása</h2>
            <div className="flex flex-col items-center gap-2">
              <input
                type="text"
                placeholder="Add meg a játék nevét"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                className="border border-gray-400 rounded px-3 py-2 w-full max-w-xs bg-gray-800 text-white"
              />
              <button onClick={handleCreateGame} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                Játék létrehozása
              </button>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Létrehozott játékok</h2>
            {games.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {games.map((game) => (
                  <li key={game.id} className="flex items-center justify-between">
                    <span className="text-lg">{getDisplayName(game)}</span>
                    <div className="flex gap-2">
                      {roomCodes[game.id] && (
                        <button
                          onClick={() => navigate(`/game?roomCode=${roomCodes[game.id]}`)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                          Csatlakozás: {roomCodes[game.id]}
                        </button>
                      )}

                      <button onClick={() => handleCreateRoom(game.id)} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">
                        Játékszoba generálása
                      </button>
                      <button onClick={() => handleEditGame(game)} className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded">
                        Szerkesztés
                      </button>
                      <button onClick={() => handleDeleteGame(game)} className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded">
                        Törlés
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nincs létrehozott játék.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center">Betöltés...</p>
      )}
    </div>
  );
};

export default Dashboard;
