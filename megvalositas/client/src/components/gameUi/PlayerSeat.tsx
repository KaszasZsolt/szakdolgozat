import React from "react";
import { Hand, CardData } from "./CardUIComponents";

interface PlayerSeatProps {
  name: string;
  cards: CardData[];
  hideCards?: boolean;
  style?: React.CSSProperties;
  onCardClick?: (card: CardData, index: number) => void;
}

const PlayerSeat: React.FC<PlayerSeatProps> = ({
  name,
  cards,
  hideCards = false,
  style,
  onCardClick,
}) => (
  <div style={style} className="flex flex-col items-center">
    <span className="mb-1 text-sm font-medium">{name}</span>
    <Hand
      cards={cards}
      hideAll={hideCards}
      onCardClick={onCardClick}
      className="mt-2"
    />
  </div>
);

export default PlayerSeat;
