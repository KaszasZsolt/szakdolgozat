import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Game {
  id: string;
  name: string;
  config?: string; // Mentett konfiguráció JSON formátumban, ha van
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{ email: string } | null>(null);
  const [error, setError] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [newGameName, setNewGameName] = useState("");

  // Token ellenőrzése és felhasználói adat lekérése
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:3011/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Nem sikerült betölteni az adatokat, kérlek jelentkezz be újra.");
        }
        const data = await res.json();
        setUserData(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, [navigate]);

  // Játékok lekérése a szervertől
  const fetchGames = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:3011/games", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Nem sikerült lekérni a játékokat.");
        }
        const gamesList = await res.json();
        setGames(gamesList);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  };

  // Új játék létrehozása
  const handleCreateGame = () => {
    if (!newGameName.trim()) {
      setError("Kérlek adj meg egy játék nevet!");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:3011/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newGameName }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Nem sikerült létrehozni a játékot.");
        }
        setNewGameName("");
        fetchGames();
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  };

  // Játék szerkesztése: navigálás a /gamecreationpage oldalra a mentett konfigurációval (ha van)
  const handleEditGame = (game: Game) => {
    navigate("/gamecreationpage", {
      state: {
        config: game.config,
        gameName: game.name,
        gameId: game.id, // Itt továbbítjuk a játék egyedi azonosítóját
      },
    });
  };

  // Játék törlése: kérd be a megerősítő szöveget, és csak akkor töröld a játékot, ha egyezik
  const handleDeleteGame = (game: Game) => {
    const confirmationText = "TÖRÖLNI"; // A várt megerősítő szöveg
    const userInput = window.prompt(
      `Biztosan törölni akarod a játékot "${game.name}"? Kérlek írd be a "${confirmationText}" szót a törlés megerősítéséhez:`
    );
    if (userInput !== confirmationText) {
      alert("A törlés nem történt meg, mert a megerősítő szöveg nem egyezett.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`http://localhost:3011/games/${game.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Nem sikerült törölni a játékot.");
        }
        alert("Játék sikeresen törölve!");
        fetchGames();
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  };

  // Játékok listájának lekérése komponens betöltésekor
  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="bg-white lg:px-[22vw] md:px-20 px-8 pt-[12vh] pb-[4vh]">
      <h1 className="text-3xl font-bold text-primary text-center mb-6">
        Dashboard
      </h1>

      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}

      {userData ? (
        <div className="text-center">
          <p className="mb-4">Üdvözlünk, {userData.email}!</p>
          {/* Játék létrehozás */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Játék Létrehozása</h2>
            <div className="flex flex-col items-center gap-2">
              <input
                type="text"
                placeholder="Add meg a játék nevét"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                className="border border-gray-400 rounded px-3 py-2 w-full max-w-xs"
              />
              <button
                onClick={handleCreateGame}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Játék létrehozása
              </button>
            </div>
          </div>

          {/* Meglévő játékok listája */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Létrehozott játékok</h2>
            {games.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {games.map((game) => (
                  <li key={game.id} className="flex items-center justify-between">
                    <span className="text-lg">{game.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditGame(game)}
                        className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                      >
                        Szerkesztés
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game)}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                      >
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
