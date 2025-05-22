import { TableMode } from "@/components/gameUi/CardUIComponents";
import { GameEngine, CardData } from "./GameEngine";

type BuiltInDeck = 'magyarkártya' | 'franciakártya';

export class GeneratedGameBase {
  public engine?: GameEngine;
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
      console.warn('nextPlayer bufferelve, amíg az engine be nem áll');
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
      console.warn('setDeckType bufferelve, amíg az engine be nem áll');
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
      console.warn('shuffleDeck bufferelve, amíg az engine be nem áll');
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
      console.warn('setMaxHandSize bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  /**
   * Kioszt count lapot a megadott player-nek.
   */
  public dealCards(count: number,playerId: string): void {
    const apply = () => this.engine!.dealCards( count ,playerId);
    if (!this.engine) {
      console.warn('dealCards bufferelve, amíg az engine be nem áll');
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
      console.warn('dealToCurrent bufferelve, amíg az engine be nem áll');
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
      console.warn('dealToAll bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  /**
   * A játékos kezéből letesz egy megadott kártyát (CardData alapján).
   * @param playerId A játékos azonosítója.
   * @param card A kártya, amit le akar tenni.
   * @returns A ténylegesen letett kártya vagy `null`, ha nem volt megtalálható vagy az engine még nincs készen.
   */
  public playCard(playerId: string, card: CardData): Promise<CardData | null> {
    if (!this.engine) {
      console.warn('playCard called before engine was set — returning null');
      return Promise.resolve(null);
    }
    // Ha az engine már megvan, hívjuk meg a tényleges metódust és adjuk vissza az eredményt
    return this.engine.playCard(playerId, card);
  }
  
  /**
   * Eltávolít egy adott kártyát a megadott játékos kezéből.
   * Az első egyező kártyát távolítja el (suit + rank alapján).
   * 
   * @param playerId A játékos azonosítója.
   * @param card A kártya, amelyet el szeretnél távolítani.
   * @returns `true`, ha sikeresen eltávolította, `false` ha nem volt ilyen kártya.
   */
  public removeCardFromPlayerHand(playerId: string, card: CardData): boolean {
    const apply = () => this.engine!.removeCardFromPlayerHand(playerId, card);
    if (!this.engine) {
      console.warn('removeCardFromPlayerHand bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(() => apply());
      return false;
    } else {
      return apply();
    }
  }

   
  /**
   * Átrendezi a játékos kezében lévő kártyák sorrendjét.
   */
  public reorderHand(playerId: string, fromIndex: number, toIndex: number): void {
    const apply = () => this.engine!.reorderHand(playerId, fromIndex, toIndex);
    if (!this.engine) {
      console.warn('reorderHand bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  public setDrawPile(cards: CardData[]): void {
    const apply = () => this.engine!.setDrawPile(cards);
    if (!this.engine) {
      console.warn('setDrawPile bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }
  
  public addToDrawPile(card: CardData): void {
    const apply = () => this.engine!.addToDrawPile(card);
    if (!this.engine) {
      console.warn('addToDrawPile bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }
  
  public drawFromPile(): CardData | null {
    const apply = () => this.engine!.drawFromPile();
    if (!this.engine) {
      console.warn('drawFromPile bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
      return null;
    } else {
      return apply();
    }
  }
  
  public getDrawPile(): CardData[] {
    const apply = () => this.engine!.getDrawPile();
    if (!this.engine) {
      console.warn('getDrawPile bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
      return [];
    } else {
      return apply();
    }
  }
  
    /**
   * Beállítja az asztalra helyezett kártyákat.
   * @param cards A lerakandó kártyák tömbje. Ha nincs megadva, a húzópakliból húz egyet.
   */
  public setTableCards(cards?: CardData[]): void {
    const apply = () => this.engine!.setTableCards(cards);
    if (!this.engine) {
      console.warn('setTableCards bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  /**
   * Hozzáad egy új lapot az asztalon lévő kártyákhoz.
   * @param card A hozzáadandó kártya.
   */
  public addTableCard(card: CardData): void {
    const apply = () => this.engine!.addTableCard(card);
    if (!this.engine) {
      console.warn('addTableCard bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  /**
   * Visszaadja az asztalon lévő összes kártyát.
   * @returns Az asztalon lévő kártyák tömbje.
   */
  public getTableCards(): CardData[] {
    const apply = () => this.engine!.getTableCards();
    if (!this.engine) {
      console.warn('getTableCards bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
      return [];
    } else {
      return apply();
    }
  }

  /**
   * Törli az asztalon lévő összes kártyát.
   */
  public clearTableCards(): void {
    const apply = () => this.engine!.clearTableCards();
    if (!this.engine) {
      console.warn('clearTableCards bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

  public registerCardEffect(key: string, handler: (card: CardData, playerId: string) => void): void {
    const apply = () => this.engine!.registerCardEffect(key, handler);
    if (!this.engine) {
      console.warn('registerCardEffect bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }

   /**
   * @returns minden játékos azonosítójához a kézben lévő kártyák listája,
   *          és broadcast-eli is ezt a "handsUpdate" csatornán.
   */
   public getHands(): Record<string, CardData[]> {
    const apply = () => this.engine!.getHands();
    if (!this.engine) {
      console.warn('getHands bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
      return {}; // üres objektum, ha még nincs engine
    } else {
      return apply();
    }
  }

  /**
   * @returns egyetlen játékos aktuális kézét, és csak neki küldi el.
   * Ha nincs megadva playerId, akkor az aktuális játékos kezét adja vissza.
   */
  public getHand(playerId?: string): CardData[] {
    const apply = () => this.engine!.getHand(playerId);
    if (!this.engine) {
      console.warn('getHand bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(() => apply());
      return []; // üres lista, ha még nincs engine
    } else {
      return apply();
    }
  }

    /**
   * Egy meglévő kártyát ad hozzá egy játékos kezéhez.
   * Ha nincs megadva playerId, akkor az aktuális játékos kapja.
   * 
   * @param card A hozzáadandó kártya.
   * @param playerId (opcionális) A játékos azonosítója. Ha nincs megadva, az aktuális játékost használja.
   */
  public giveCardToPlayer(card: CardData, playerId?: string): void {
    const apply = () => this.engine!.giveCardToPlayer(card, playerId);
    if (!this.engine) {
      console.warn('giveCardToPlayer bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }
    /**
   * Visszaadja az aktuális játékost (aki éppen soron van).
   * 
   * @returns Az aktuális játékos objektuma.
   */
    public getCurrentPlayer(): any {
      const apply = () => this.engine!.getCurrentPlayer();
      if (!this.engine) {
        console.warn('getCurrentPlayer bufferelve, amíg az engine be nem áll');
        this.pendingCalls.push(apply);
        return null;
      } else {
        return apply();
      }
    }


      /**
   * Általános célú választáskérés a játékostól.
   * Küldesz neki egy listát (pl. kártyák, számok, szövegek), és megadhatsz egy függvényt,
   * ami a választás után lefut a kiválasztott elem vagy index alapján.
   * 
   * @param options A választható opciók tömbje (pl. kártyák).
   * @param onSelected Callback, amely megkapja a kiválasztott értéket vagy null-t ha timeout vagy nem választott.
   * @param timeoutMs (opcionális) időkorlát ezredmásodpercben. Ha nincs megadva, nincs timeout.
   */
  public async waitForSelection<T>(
    options: T[],
    onSelected: (selected: T | null, index: number | null) => void,
    timeoutMs?: number
  ): Promise<void> {
    const apply = async () => await this.engine!.waitForSelection(options, onSelected, timeoutMs);
    if (!this.engine) {
      console.warn('waitForSelection bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(() => apply());
      return Promise.resolve(); // üres promise, ha még nincs engine
    } else {
      return apply();
    }
  }


    /**
   * Visszaadja a pakli jelenlegi állapotát (a még kiosztható lapokat).
   * Ez nem tartalmazza a már kiosztott kézben lévő, vagy az asztalon lévő lapokat.
   *
   * @returns A pakliban lévő kártyák tömbje.
   *
   * @example
   * const deck = game.getDeck();
   * console.log(`A pakliban ${deck.length} lap maradt.`);
   */
    public getDeck(): CardData[] {
      const apply = () => this.engine!.getDeck();
      if (!this.engine) {
        console.warn('getDeck bufferelve, amíg az engine be nem áll');
        this.pendingCalls.push(apply);
        return [];
      } else {
        return apply();
      }
    }
  

    /**
   * Megmondja, hogy az aktuális játékos (vagy megadott játékos) választott-e már ebben a körben.
   * 
   * @param playerId (opcionális) A játékos azonosítója. Ha nincs megadva, az aktuális játékosra néz.
   * @returns `true`, ha már választott, `false`, ha még nem, `null`, ha nem található a játékos.
   *
   * @example
   * if (game.hasPlayerChosen()) {
   *   console.log("A játékos már választott.");
   * } else {
   *   console.log("Még nem választott.");
   * }
   */
  public hasPlayerChosen(playerId?: string): boolean | null {
    const apply = () => this.engine!.hasPlayerChosen(playerId);
    if (!this.engine) {
      console.warn('hasPlayerChosen bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(() => apply());
      return null;
    } else {
      return apply();
    }
  }
  
  /**
   * Visszaadja a tábla tetején (legutóbb lerakott) kártyát.
   * Ha nincs egyetlen lap sem az asztalon, undefined‐ot ad vissza.
   */
  public getTableTop(): CardData | undefined {
    const cards = this.getTableCards();
    return cards.length > 0 ? cards[cards.length - 1] : undefined;
  }

    /**
   * Visszaadja a tábla tetején (legutóbb lerakott) kártyát.
   * Ha nincs egyetlen lap sem az asztalon, undefined‐ot ad vissza.
   */
    public setTableCardMode(tableCardMode: TableMode) {
      const apply = () => this.engine!.setTableCardMode(tableCardMode);
      if (!this.engine) {
        console.warn('getDeck bufferelve, amíg az engine be nem áll');
        this.pendingCalls.push(apply);
        return [];
      } else {
        return apply();
      }
    }

  public notify(message: string, description?: string, playerId?: string): void {
    const apply = () => this.engine!.notify(message, description, playerId);
    if (!this.engine) {
      console.warn('notify bufferelve, amíg az engine be nem áll');
      this.pendingCalls.push(apply);
    } else {
      apply();
    }
  }
  
  public getPlayers(): any[] {
    if (!this.engine) {
      console.warn('getPlayers hívva, de az engine még nincs inicializálva – üres listát ad vissza.');
      return [];
    }
    return this.engine.getPlayers();
  }
}
