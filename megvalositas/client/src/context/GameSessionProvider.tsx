import React, { useState, useEffect } from "react";
import { GameSession, GameSessionContext } from "./GameSessionContext";

export const GameSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameName, setGameName] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  useEffect(() => {
    if (roomCode) {
      localStorage.setItem("roomCode", roomCode);
    } else {
      localStorage.removeItem("roomCode");
    }

    if (gameName) {
      localStorage.setItem("gameName", gameName);
    } else {
      localStorage.removeItem("gameName");
    }
  }, [roomCode, gameName]);

  const setGameSession = (session: Partial<GameSession>) => {
    if (session.gameName !== undefined) setGameName(session.gameName);
    if (session.roomCode !== undefined) setRoomCode(session.roomCode);
    if (session.isHost !== undefined) setIsHost(session.isHost);
  };

  const resetGameSession = () => {
    setGameName(null);
    setRoomCode(null);
    setIsHost(false);
    localStorage.removeItem("roomCode");
    localStorage.removeItem("gameName");
  };

  return (
    <GameSessionContext.Provider
      value={{ gameName, roomCode, isHost, setGameSession, resetGameSession }}
    >
      {children}
    </GameSessionContext.Provider>
  );
};
