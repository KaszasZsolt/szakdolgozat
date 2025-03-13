import { fetchWithAuth } from "./apiClient";
import { Game } from "./dashboardService"; 
export async function createGame(name: string, mergedConfig: Record<string, unknown>) {
  const res = await fetchWithAuth("/games/config", {
    method: "POST",
    body: JSON.stringify({
      name,
      config: JSON.stringify(mergedConfig),
    }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Ismeretlen hiba a mentésnél");
  }
  return await res.json();
}

export async function updateGame(gameId: string, mergedConfig: Record<string, unknown>) {
  const res = await fetchWithAuth(`/games/${gameId}/config`, {
    method: "PUT",
    body: JSON.stringify({
      config: JSON.stringify(mergedConfig),
    }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Ismeretlen hiba a frissítésnél");
  }
  return await res.json();
}

export async function fetchGameById(gameId: string): Promise<Game> {
  const res = await fetchWithAuth(`/games/${gameId}`, {
    method: "GET",
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Nem sikerült lekérni a játékot.");
  }
  return res.json();
}