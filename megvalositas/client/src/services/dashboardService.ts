import { fetchWithAuth } from "./apiClient";

export interface Game {
  id: string;
  name: string;
  config?: string; // A mentett konfiguráció JSON formátumban, ha van
}

/**
 * Lekéri a bejelentkezett felhasználó adatait.
 */
export async function getUserData(): Promise<{ email: string }> {
  const res = await fetchWithAuth("http://localhost:3011/dashboard", {
    method: "GET",
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Nem sikerült betölteni az adatokat.");
  }
  return res.json();
}

/**
 * Lekéri a bejelentkezett felhasználó játékait.
 */
export async function fetchGames(): Promise<Game[]> {
  const res = await fetchWithAuth("http://localhost:3011/games", {
    method: "GET",
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Nem sikerült lekérni a játékokat.");
  }
  return res.json();
}

/**
 * Létrehoz egy új játékot a megadott névvel.
 */
export async function createGame(name: string): Promise<any> {
  const res = await fetchWithAuth("http://localhost:3011/games", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Nem sikerült létrehozni a játékot.");
  }
  return res.json();
}

/**
 * Töröl egy játékot a megadott azonosító alapján.
 */
export async function deleteGame(gameId: string): Promise<any> {
  const res = await fetchWithAuth(`http://localhost:3011/games/${gameId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Nem sikerült törölni a játékot.");
  }
  return res.json();
}
