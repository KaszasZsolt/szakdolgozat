import { GameEngine, CardData } from "./GameEngine";

type BuiltInDeck = 'magyarkártya' | 'pókerkártya';

export class GeneratedGameBase {
  protected engine?: GameEngine;
  private pendingCalls: Array<() => void> = [];

  constructor() {
    
  }

  /**
   * Called by GameEngine immediately after instantiating your subclass.
   * Flushes any buffered calls now that `this.engine` is set.
   */
  public setEngine(engine: GameEngine): void {
    this.engine = engine;
    // Flush all buffered calls in order
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
        ['piros','zöld','makk','tök'].forEach(suit =>
          ['VII','VIII','IX','X','alsó','felső','király','ász'].forEach(rank =>
            cards.push({ suit, rank })
          )
        );
      } else {  // pókerkártya
        ['♠','♥','♦','♣'].forEach(suit =>
          ['2','3','4','5','6','7','8','9','10','J','Q','K','A'].forEach(rank =>
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
}
