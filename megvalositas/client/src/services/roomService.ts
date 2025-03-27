import { fetchWithAuth } from "./apiClient";

export async function createGameRoom(data: { gameId: string }): Promise<{ code: string }> {
  const res = await fetchWithAuth("/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Hiba a szoba létrehozásakor.");
  }
  return res.json();
}

export async function joinGameRoom(code: string): Promise<{ gameConfig
    : string;}> {
  const res = await fetchWithAuth(`/rooms/${code}`, {
    method: "GET",
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Hiba a szoba lekérésekor.");
  }
  return res.json();
}
