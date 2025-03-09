import { fetchWithAuth } from "./apiClient";

export async function createGame(name: string, mergedConfig: Record<string, unknown>) {
  const res = await fetchWithAuth("http://localhost:3011/games/config", {
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
  const res = await fetchWithAuth(`http://localhost:3011/games/${gameId}/config`, {
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
