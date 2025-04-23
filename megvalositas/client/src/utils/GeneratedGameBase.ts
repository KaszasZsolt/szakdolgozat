import { GameEngine, CardData } from "./GameEngine";

type BuiltInDeck = 'magyarkártya' | 'pókerkártya';

export class GeneratedGameBase {
  protected engine?: GameEngine;
  private pendingCalls: Array<() => void> = [];

  constructor() {}

  /**
   * Called by GameEngine immediately after instantiating your subclass.
   * Flushes any buffered calls now that `this.engine` is set.
   */
  public setEngine(engine: GameEngine): void {
    this.engine = engine;
    this.pendingCalls.forEach(fn => fn());
    this.pendingCalls = [];
  }

  /**
   * Advances to the next player, or buffers the call if engine's not ready yet.
   */
  public nextPlayer(direction: 'forward' | 'backward' = 'forward'): void {
    const apply = () => this.engine!.nextPlayer(direction);
    if (!this.engine) {
      console.warn('nextPlayer buffered until engine is set');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  /**
   * Sets up the deck (built‑in or custom), or buffers if engine's not ready yet.
   */
  public setDeckType(deck: BuiltInDeck | CardData[]): void {
    const apply = () => {
      let cards: CardData[] = [];
      if (Array.isArray(deck)) {
        cards = deck;
      } else if (deck === 'magyarkártya') {
        ['piros', 'zöld', 'makk', 'tök'].forEach(suit =>
          ['VII', 'VIII', 'IX', 'X', 'alsó', 'felső', 'király', 'ász'].forEach(rank =>
            cards.push({ suit, rank })
          )
        );
      } else {
        ['♠', '♥', '♦', '♣'].forEach(suit =>
          ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].forEach(rank =>
            cards.push({ suit, rank })
          )
        );
      }
      this.engine!.setDeck(cards);
    };

    if (!this.engine) {
      console.warn('setDeckType buffered until engine is set');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  /**
   * A pakli megkeverése Fisher–Yates algoritmussal.
   */
  public shuffleDeck(): void {
    const apply = () => this.engine!.shuffleDeck();
    if (!this.engine) {
      console.warn('shuffleDeck buffered until engine is set');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  /**
   * Beállítja, hogy egy játékosnál maximum hány lap lehet kézben.
   */
  public setMaxHandSize(size: number): void {
    const apply = () => this.engine!.setMaxHandSize(size);
    if (!this.engine) {
      console.warn('setMaxHandSize buffered until engine is set');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  /**
   * Kioszt count lapot a megadott player-nek.
   */
  public dealCards(playerId: string, count: number): void {
    const apply = () => this.engine!.dealCards(playerId, count);
    if (!this.engine) {
      console.warn('dealCards buffered until engine is set');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  /**
   * Kioszt count lapot az aktuális játékosnak.
   */
  public dealToCurrent(count: number): void {
    const apply = () => this.engine!.dealToCurrent(count);
    if (!this.engine) {
      console.warn('dealToCurrent buffered until engine is set');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  /**
   * Kioszt count lapot minden regisztrált játékosnak.
   */
  public dealToAll(count: number): void {
    const apply = () => this.engine!.dealToAll(count);
    if (!this.engine) {
      console.warn('dealToAll buffered until engine is set');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  // /**
  //  * A játékos kezéből letesz egy kártyát a megadott indexről.
  //  */
  // public playCard(playerId: string, index: number): CardData | null {
  //   if (!this.engine) {
  //     console.warn('playCard buffered until engine is set');
  //     let result: CardData | null = null;
  //     this.pendingCalls.push(() => {
  //       result = this.engine!.playCard(playerId, index);
  //     });
  //     return result;
  //   }
  //   return this.engine.playCard(playerId, index);
  // }

  /**
   * Átrendezi a játékos kezében lévő kártyák sorrendjét.
   */
  public reorderHand(playerId: string, fromIndex: number, toIndex: number): void {
    const apply = () => this.engine!.reorderHand(playerId, fromIndex, toIndex);
    if (!this.engine) {
      console.warn('reorderHand buffered until engine is set');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }
}
