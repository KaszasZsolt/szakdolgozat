import { fetchWithAuth } from "./apiClient";
interface AuthResponse {
  accessToken?: string;
  message: string;
  userId?: string;
}
  
  /**
   * Bejelentkezés API hívás.
   * @param email A felhasználó email címe
   * @param password A felhasználó jelszava
   * @returns Az API válasza, mely tartalmazza az accessToken-t, ha sikeres a bejelentkezés.
   */
  export async function login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetchWithAuth(`/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Hiba történt a bejelentkezés során");
    }
    return data;
  }
  
  /**
   * Regisztráció API hívás.
   * @param email A felhasználó email címe
   * @param password A felhasználó jelszava
   * @returns Az API válasza
   */
  export async function register(email: string, password: string): Promise<AuthResponse> {
    const response = await fetchWithAuth(`/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Hiba történt a regisztráció során");
    }
    return data;
  }
  