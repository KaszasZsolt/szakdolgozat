import React from "react";

/**
 * Típus a kártya adatainak leírására
 */
export interface CardData {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: string; // "A", "2".."10", "J", "Q", "K"
}

/**
 * Egyetlen kártya megjelenítése.
 * @param card     – a kártya meta‑adatai, ha `hidden` false
 * @param hidden   – igaz esetén a kártya háttal felfelé jelenik meg
 * @param className – opcionális extra Tailwind osztályok
 */
export const Card: React.FC<{
  card?: CardData;
  hidden?: boolean;
  className?: string;
  onClick?: () => void;
}> = ({ card, hidden = false, className = "", onClick }) => {
  const base =
    "w-14 sm:w-16 md:w-20 lg:w-24 aspect-[5/7] rounded-lg shadow-md flex flex-col justify-between p-1 sm:p-2 text-xs sm:text-sm md:text-base font-semibold select-none";
  const back =
    "bg-gradient-to-br from-blue-600 to-indigo-700 text-transparent border-2 border-blue-300";
  const red = "text-red-600";
  const black = "text-gray-800 dark:text-gray-100";

  if (hidden || !card) {
    return (
      <div
        className={`${base} ${back} ${className}`}
        onClick={onClick}
      />
    );
  }

  const suitSymbols: Record<string, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };
  const symbol = suitSymbols[card.suit] ?? card.suit;
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const color = isRed ? red : black;

  return (
    <div
      className={`${base} bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600 ${color} ${className}`}
      onClick={onClick}
    >
      {/* Bal-fent */}
      <div>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
      {/* Közép */}
      <div className="text-center text-xl md:text-2xl lg:text-3xl">
        {symbol}
      </div>
      {/* jobb lent, fordítva */}
      <div className="rotate-180 text-right">
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
    </div>
  );
};


/**
 * Játékos kéz – sorban jeleníti meg a kártyákat.
 */
export const Hand: React.FC<{
  cards: CardData[];
  hideAll?: boolean;
  onCardClick?: (card: CardData, index: number) => void;
  className?: string;
}> = ({ cards, hideAll = false, onCardClick, className = "" }) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {cards.map((c, i) => (
        <Card
          key={i}
          card={c}
          hidden={hideAll}
          className="cursor-pointer"
          onClick={() => onCardClick?.(c, i)}
        />
      ))}
    </div>
  );
};

/**
 * A pakli hátlapja, opcionálisan számlálóval.
 */
export const Deck: React.FC<{
  remaining: number;
  onClick?: () => void;
  className?: string;
}> = ({ remaining, onClick }) => (
  <div className="relative" onClick={onClick}>
    <Card hidden />
    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1 rounded">
      {remaining}
    </span>
  </div>
);

export type TableMode = "stack" | "spread" | "hidden";

export interface TableAreaProps {
  cards: CardData[];
  mode?: TableMode;
  overlapOffset?: number;
  visibleCount?: number;          // ha megadod, mindig az utolsó N lap jelenik meg
  width?: string;              // pl. "400px" vagy "100%"
  height?: string;             // pl. "200px"
  onCardClick?: (card: CardData, index: number) => void;
  className?: string;
}

/**
 * Középső asztal.
 */
export const TableArea: React.FC<TableAreaProps> = ({
  cards,
  mode = "spread",
  overlapOffset = -0.2,
  visibleCount,
  width = "100%",
  height = "100%",
  onCardClick,
  className = "",
}) => {
  // ha hidden, csak egy facedown pakli
  if (mode === "hidden") {
    return (
      <div className={`${className}`}  style={{ width, height }}>
        <Card hidden onClick={() => onCardClick?.(cards[0], 0)} />
      </div>
    );
  }

  // ha stack: egymás tetején tolva
  if (mode === "stack") {
    return (
      <div className={`relative ${className}`} style={{ width, height }}  >
        {cards.map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${i * overlapOffset}px`,
              top: `${i * overlapOffset}px`,
            }}
          >
            <Card card={c} onClick={() => onCardClick?.(c, i)} />
          </div>
        ))}
      </div>
    );
  }

  // spread mód: sorban; lehet limitálni visibleCount-tel
  const toShow = typeof visibleCount === "number"? cards.slice(-visibleCount): cards;

  return (
    <div
      className={`flex flex-wrap justify-center items-center gap-2 overflow-auto p-2 ${className}`}
      style={{
        width,
        height,
      }}
    >
      {toShow.length === 0 ? (
        <span className="text-gray-400 text-sm">Nincs kártya az asztalon</span>
      ) : (
        toShow.map((c, i) => (
          <Card
            key={i}
            card={c}
            onClick={() => onCardClick?.(c, i)}
          />
        ))
      )}
    </div>
  );
};

