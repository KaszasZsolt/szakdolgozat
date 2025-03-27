import { useContext } from "react";
import { GameSessionContext } from "../context/GameSessionContext";

export const useGameSession = () => {
  return useContext(GameSessionContext);
};