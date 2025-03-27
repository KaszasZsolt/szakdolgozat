import { createContext } from "react";

export interface GameSession {
  gameName: string | null;
  roomCode: string | null;
  isHost: boolean;
  setGameSession: (session: Partial<GameSession>) => void;
  resetGameSession: () => void;
}

export const GameSessionContext = createContext<GameSession>({
  gameName: null,
  roomCode: null,
  isHost: false,
  setGameSession: () => {},
  resetGameSession: () => {}
});
