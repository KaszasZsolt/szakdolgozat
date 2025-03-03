export async function createGame(token: string, name: string, mergedConfig: Record<string, unknown>) {
    const res = await fetch("http://localhost:3011/games/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
  
  export async function updateGame(token: string, gameId: string, mergedConfig: Record<string, unknown>) {
    const res = await fetch(`http://localhost:3011/games/${gameId}/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
  