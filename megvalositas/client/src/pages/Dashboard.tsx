import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{ email: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Token ellenőrzése: ha nincs token, irányítsa a bejelentkezési oldalra.
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Védett adat lekérése a szervertől (példa végpont)
    fetch("http://localhost:3011/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          // Ha a token lejárt vagy hibás, akkor navigáljunk vissza a bejelentkezésre
          throw new Error("Nem sikerült betölteni az adatokat, kérlek jelentkezz be újra.");
        }
        const data = await res.json();
        setUserData(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, [navigate]);

  // Kijelentkezés: token törlése és navigáció a bejelentkezési oldalra
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
          {/* Itt további dashboard tartalmakat adhatsz hozzá */}
        </div>
      ) : (
        <p className="text-center">Betöltés...</p>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Kijelentkezés
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
