import { API_BASE_URL } from "../config/config";
/**
 * fetchWithAuth - Egy wrapper függvény a fetch API-hoz, amely automatikusan frissíti a JWT tokent, ha azt 401-es hibával jelzi.
 *
 * @param route - A kérés útvonala pl. /login.
 * @param options - A fetch API által támogatott konfigurációs opciók.
 * @returns A Response objektum, vagy ha szükséges, újrapróbálva az eredeti kérést a frissített tokennel.
 */
export async function fetchWithAuth(route: string, options: RequestInit = {}): Promise<Response> {
    const defaultHeaders = {
      "Content-Type": "application/json",
    };
  
    const headers: Record<string, string> = {
      ...defaultHeaders,
      ...(options.headers as Record<string, string>),
    };
  
    let token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  
    const response = await fetch(`${API_BASE_URL}${route}`, {
      ...options,
      headers,
    });
  
    if (response.status === 401) {
      const refreshResponse = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        credentials: "include",
      });
  
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
          token = data.accessToken;
          headers["Authorization"] = `Bearer ${token}`;
          return fetch(`${API_BASE_URL}${route}`, {
            ...options,
            headers,
          });
        } else {
          throw new Error("Refresh token sikeres, de az access token hiányzik a válaszból.");
        }
      } else {
        throw new Error("A felhasználói munkamenet lejárt, kérlek jelentkezz be újra.");
      }
    }
  
    return response;
  }
  