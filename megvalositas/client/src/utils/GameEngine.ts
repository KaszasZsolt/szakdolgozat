import { toValidMethodName } from "./toValidMethorName";
export interface CardData {
  suit: string;
  rank: string;

}
type CardEffectHandler = (card: CardData, playerId: string) => void | Promise<void>;
type BuiltInDeck = 'magyarkártya' | 'franciakártya';
export interface GameConfig {
  game: string;
  states: {
    [key: string]: {
      actions: { name: string; code?: string }[];
      next: string | null;
      enableActionSelection?: boolean;
      choiceTime?: number;
      previous?: string | null;
      host?: string | null;
    };
  };
}

export class GameEngine {
  private gameInstance: any;
  private config: GameConfig;

  // Az éppen aktuális állapot
  private currentState: string | null;
  // A history egy tömb, amiben sorban tároljuk, hogy mely állapotokat jártunk be
  private stateHistory: string[] = [];

  private players: any[] = [];
  private deck: CardData[] = [];
  private currentPlayerIndex: number = 0;

  // Választott akció és a Promise-mechanizmus a felhasználói döntéshez
  private selectionPromise: Promise<string | null> | null = null;
  private selectionResolver: ((action: string | null) => void) | null = null;

  private isRunning = false;
  private eventHandlers: Record<string, ((...args: any[]) => void)[]> = {};

  // Socket kapcsolat
  private socket: any;

  // Logok tárolása
  private logs: string[] = [];

  private drawPile: CardData[] = [];
  private tableCards: CardData[] = [];
  private cardEffects: Map<string, CardEffectHandler> = new Map();
  private playerSelectionStatus: Record<string, boolean> = {};

  constructor(config: GameConfig, socket?: any) {
    this.config = config;
    if (socket) {
      this.socket = socket;
      this.initializeSocketEvents();
    }
    const className = config.game.replace(/\s+/g, "");
    if ((window as any)[className]) {
      this.gameInstance = new (window as any)[className]();
      this.gameInstance.setEngine(this);
    } else {
      throw new Error("A generált játékosztály nem található.");
    }

    const initialState = Object.keys(config.states)[0];
    if (!initialState) {
      throw new Error("A konfiguráció nem tartalmaz állapotokat!");
    }
    this.currentState = initialState;
    this.stateHistory.push(this.currentState);
    this.log(`Belépés az állapotba: ${this.currentState}`);
  }

  // Logolás – minden fontos üzenetet itt rögzítünk, majd emitálunk "log" eseményt
  private log(message: string): void {
    this.logs.push(message);
    console.log(message);
    if (this.socket) {
      this.socket.emit("log", message);
    }
  }

  
  
  public setTableCardMode(mode: string): void {
    if (this.socket) {
      this.socket.emit("tableCardMode", {tableCardMode:mode});
    }
  }

  // Socket események inicializálása (például, hogy a szerver értesüljön, ha állapotváltozás történik)
  private initializeSocketEvents() {
    if (!this.socket) return;

    this.socket.on("gameUpdate", (data: any) => {
      this.log("Game update from server: " + JSON.stringify(data));
      if (data.newState) {
        this.currentState = data.newState;
        this.stateHistory.push(data.newState);
      }
      this.emit("stateChanged", this.currentState);
    });

    // A kliens által indított start esemény visszajelzése is feldolgozható
    this.socket.on("startGame", (data: any) => {
      this.log("Start game event received: " + JSON.stringify(data));
    });

    this.socket.on("actionSelected", (data: any) => {
      if (this.selectionResolver &&
        data?.player?.id === this.getCurrentPlayer()?.id) {

        this.log(`ACTION SELECTED from remote: ${data?.action}`);
        this.selectionResolver(data?.action);   // <-- feloldjuk a promise‑t
      }
    });
  }

  // Eseménykezelő metódusok
  public on(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  public off(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
  }

  public emit(event: string, ...args: any[]): void {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(...args));
    }
    if (this.socket && event === "stateChanged") {
      this.socket.emit("stateChanged", { state: args[0] });
    }
  }


  public getCurrentPlayer(): any {
    return this.players[this.currentPlayerIndex];
  }

  public getPlayers(): any[] {
    return this.players;
  }

  public resetGame(): void {
    this.currentState = Object.keys(this.config.states)[0] || null;
    this.stateHistory = this.currentState ? [this.currentState] : [];
    this.currentPlayerIndex = 0;
    this.selectionPromise = null;
    this.selectionResolver = null;
    this.log("A játékot újraindítottuk.");

    if (this.socket) {
      this.socket.emit("gameReset", { message: "A játékot újraindították." });
    }

    if (this.currentState) {
      this.runOneStep();
    }
  }
  public isGameFinished(): boolean {
    return this.currentState === null;
  }
  public nextPlayer(direction: 'forward' | 'backward' = 'forward'): void {
    if (this.players.length === 0) return;
    if (direction === 'forward') {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } else {
      this.currentPlayerIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
    }
    this.log("Következő játékos: " + JSON.stringify(this.getCurrentPlayer()));
    if (this.socket) {
      this.socket.emit("playerChanged", { currentPlayer: this.getCurrentPlayer() });
    }
    this.log("Másik játékosra váltottunk")
  }

  /**
   * A játék egy lépésének végrehajtása.
   */
  public async runOneStep(): Promise<void> {
    if (this.isRunning) {
      this.log("runOneStep már fut, megvárjuk amíg befejeződik.");
      return;
    }
    this.isRunning = true;

    try {
      if (!this.currentState) {
        this.log("A játék véget ért. Nincs több lépés.");
        return;
      }

      this.log(`Futtatom az állapotot: ${this.currentState}`);
      const stateMethod = toValidMethodName(this.currentState);
      if (typeof this.gameInstance[stateMethod] === "function") {
        const result = this.gameInstance[stateMethod]();
        if (result instanceof Promise) {
          await result;
        }
      } else {
        this.log(`Az állapot metódus "${stateMethod}" nem található.`);
      }

      const stateData = this.config.states[this.currentState];

      // Ha dönteni kell akkor várjuk a user akcióját vagy time outot
      if (stateData.enableActionSelection) {
        this.log("Választásra váró állapot. Timeout: " + (stateData.choiceTime ?? 0) + " mp");
        const timeout = stateData.choiceTime ? stateData.choiceTime * 1000 : 0;
        const chosenAction = await this.waitForUserSelection(timeout);
        console.log("chosenAction12312313", chosenAction);
        if (chosenAction) {
          this.log(`Felhasználó által kiválasztott akció: ${chosenAction}`);
          if (this.socket) {
            this.socket.emit("actionSelected", { action: chosenAction, player: this.getCurrentPlayer() });
          }
          if (typeof this.gameInstance[chosenAction] === "function") {
            const result = this.gameInstance[chosenAction]();
            if (result instanceof Promise) {
              await result;
            }
          } else {
            this.log(`Az akciómetódus "${chosenAction}" nem található a gameInstance-ben.`);
          }
        } else {
          this.log("Nem történt felhasználói választás, továbblépünk akció nélkül.");
        }
      } else {
        // Ha nem decision state, akkor lefuttatjuk az összes akciót
        for (const action of stateData.actions) {
          const actionMethod = toValidMethodName(action.name);
          this.log(`Futtatom az akciót: ${action.name} (${actionMethod})`);
          if (typeof this.gameInstance[actionMethod] === "function") {
            this.gameInstance[actionMethod]();
            if (this.socket) {
              this.socket.emit("actionExecuted", { action: action.name, player: this.getCurrentPlayer() });
            }
          } else {
            this.log(`Az akció metódus "${actionMethod}" nem található a gameInstance-ben.`);
          }
        }
      }
      const conditionMethodName = toValidMethodName(this.currentState) + "NextCondition";
      let shouldTransition = true;
      if (typeof this.gameInstance[conditionMethodName] === "function") {
        shouldTransition = this.gameInstance[conditionMethodName]();
      }

      if (shouldTransition) {
        if (stateData.next === null) {
          this.log("A játék véget ért (next = null).");
          this.currentState = null;
        } else {
          this.log(`Tovább lépünk a(z) "${stateData.next}" állapotba.`);
          this.currentState = stateData.next;
          this.stateHistory.push(this.currentState);
          setTimeout(() => {
            this.runOneStep();
          }, 10);
        }
      } else {
        // Ha a nextCondition false, ellenőrizzük, hogy van-e "previous" beállítva
        if (stateData.previous) {
          this.log(`Visszalépünk a korábbi állapotra: ${stateData.previous}`);
          this.currentState = stateData.previous;
          this.stateHistory.push(this.currentState);
          setTimeout(() => {
            this.runOneStep();
          }, 1000);
        } else {
          this.log("A nextCondition false, de nincs visszalépési állapot beállítva, így maradunk az aktuális állapotban: " + this.currentState);
        }
      }

      if (this.socket) {
        this.socket.emit("stepCompleted", { currentState: this.currentState });
      }
    } finally {
      this.isRunning = false;
    }
  }
  public startGame(): void {
    this.log("Játék indítása...");
    if (this.socket) {
      this.socket.emit("gameStarted", { message: "A játék elindult!" });
    }
    this.runOneStep();
  }

  public goToPreviousState(): void {
    if (this.stateHistory.length > 1) {
      this.stateHistory.pop();
      this.currentState = this.stateHistory[this.stateHistory.length - 1];
      this.log("Visszaléptem az előző állapotra: " + this.currentState);
      if (this.socket) {
        this.socket.emit("stateChanged", { state: this.currentState });
        this.emit("stateChanged", { state: this.currentState });
      }
    } else {
      this.log("Nincs korábbi állapot, nem tudok visszalépni.");
    }
  }
  public isGameStarted(): boolean {
    return this.stateHistory.length > 1;
  }

  public performAction(actionName: string): void {
    if (!this.currentState) {
      this.log("A játék véget ért, nem futtatunk több akciót.");
      return;
    }

    const stateData = this.config.states[this.currentState];
    if (stateData.enableActionSelection) {
      this.setSelectedAction(actionName);
    } else {
      // Nem kell dönteni, azonnal lefuttatjuk
      const actionMethod = actionName;
      if (typeof this.gameInstance[actionMethod] === "function") {
        this.log(`PerformAction: futtatom az akciót: ${actionMethod}`);
        this.gameInstance[actionMethod]();
      } else {
        this.log(`Az akció metódus "${actionMethod}" nem található a gameInstance-ben.`);
      }
    }
  }

  /**
   * Aktuális állapot neve (null, ha vége).
   */
  public getCurrentState(): string | null {
    return this.currentState;
  }

  /**
   * Az aktuális állapot akcióit adja vissza (MethodName formában).
   */
  public getAvailableActions(): string[] {
    if (!this.currentState) return [];
    const stateData = this.config.states[this.currentState];
    return stateData.actions.map((a) => toValidMethodName(a.name));
  }






  /**
   * Beállítja a felhasználó által választott akciót.
   */
  public setSelectedAction(actionName: string) {
    if (this.selectionResolver) {
      this.selectionResolver(actionName);
      if (this.socket) {
        this.socket.emit("actionSelected", { action: actionName, player: this.getCurrentPlayer() });
      }
    }
  }

  public setDeck(deck: BuiltInDeck | CardData[]): void {
    let cards: CardData[] = [];
  
    if (Array.isArray(deck)) {
      cards = deck;
    } else if (deck === 'magyarkártya') {
      ['piros', 'zöld', 'makk', 'tök'].forEach(suit =>
        ['VII', 'VIII', 'IX', 'X', 'alsó', 'felső', 'király', 'ász'].forEach(rank =>
          cards.push({ suit, rank })
        )
      );
    } else if (deck === 'franciakártya') {
      ['♠', '♥', '♦', '♣'].forEach(suit =>
        ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].forEach(rank =>
          cards.push({ suit, rank })
        )
      );
    } else {
      throw new Error(`Ismeretlen deck típus: ${deck}`);
    }
  
    this.deck = [...cards];
    this.log(`Pakli beállítva: ${JSON.stringify(this.deck)}`);
  }

  
  /**
  * A pakli megkeverése Fisher–Yates algoritmussal.
  */
  public shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    this.log(`Pakli megkeverve: ${JSON.stringify(this.deck)}`);
  }
  /** maximum kézméret */
  private maxHandSize: number = Infinity;
  /** játékosok kezének tárolása: player.id => CardData[] */
  private hands: Record<string, CardData[]> = {};

  public setPlayers(players: any[]): void {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.hands = {};
    players.forEach(p => {
      if (!p.id) throw new Error("Minden player-nek kell, hogy legyen id mezője!");
      this.hands[p.id] = [];
    });
  }

  /**
   * Beállítja, hogy egy játékosnál maximum hány lap lehet kézben.
   */
  public setMaxHandSize(size: number): void {
    this.maxHandSize = size;
    this.log(`Max kézméret beállítva: ${size}`);
  }

  /**
   * Kioszt count lapot a megadott player-nek (legfeljebb a maxHandSize erejéig).
   */
  public dealCards(count: number,playerId: string): void {
    const hand = this.hands[playerId];
    if (!hand) throw new Error(`Player ${playerId} nincs regisztrálva!`);
    for (let i = 0; i < count; i++) {
      if (hand.length >= this.maxHandSize) {
        this.log(`Nem osztható több lap ${playerId}-nek, elérte a max kézméretet.`);
        break;
      }
      const card = this.deck.shift();
      if (!card) {
        this.log("Nincs több lap a pakliban.");
        break;
      }
      hand.push(card);
    }
    this.log(`Kiosztva ${hand.length} lap ${playerId}-nek: ${JSON.stringify(hand)}`);
  }
  /**
   * Kioszt count lapot az aktuális játékosnak (legfeljebb a maxHandSize erejéig).
   */
  public dealToCurrent(count: number): void {
    const current = this.getCurrentPlayer();
    if (!current?.id) throw new Error("Nincs érvényes current player!");
    this.dealCards( count,current.id);
  }

  /**
 * Kioszt count lapot minden regisztrált játékosnak
 * (legfeljebb a beállított max kézméretig).
 * @param count A kiosztandó kártyák száma.
 */
  public dealToAll(count: number): void {
    this.players.forEach(player => {
      if (!player.id) {
        this.log("dealToAll: egy player-nek nincs id mezője, kihagyva.");
        return;
      }
      this.dealCards( count,player.id);
      this.getHands()
    });
    this.log(`dealToAll: minden játékosnak kiosztva ${count} lap.`);
  }

 

    /**
   * A játékos kezéből letesz egy konkrét kártyát.
   * Az első egyező kártyát távolítja el a kézből.
   * @param playerId A játékos ID-je.
   * @param card A letenni kívánt kártya.
   * @returns A ténylegesen letett kártya vagy `null`, ha nem található.
   */
  public async playCard(playerId: string, card: CardData): Promise<CardData | null> {
    const hand = this.hands[playerId];
    if (!hand) throw new Error(`Player ${playerId} nincs regisztrálva!`);

    const index = hand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
    if (index === -1) {
      this.log(`playCardByValue: a kártya nem található a játékos kezében: ${JSON.stringify(card)}`);
      return null;
    }

    const [playedCard] = hand.splice(index, 1);
    this.log(`Player ${playerId} letette: ${JSON.stringify(playedCard)}`);

    const handlerRunner = async (handler: CardEffectHandler) => {
      const result = handler(playedCard, playerId);
      if (isPromise(result)) {
        await result;
      }
    };
  
    const fullKey = `${playedCard.suit}_${playedCard.rank}`;
    if (this.cardEffects.has(fullKey)) {
      await handlerRunner(this.cardEffects.get(fullKey)!);
    } else if (this.cardEffects.has(playedCard.rank)) {
      await handlerRunner(this.cardEffects.get(playedCard.rank)!);
    } else {
      this.log(`Nincs hatás ehhez a laphoz: ${fullKey}`);
    }

    if (this.socket) {
      this.socket.emit("handUpdate", { playerId, hand: [...hand] });
    }

    return playedCard;
  }

  /**
   * Eltávolít egy adott kártyát a megadott játékos kezéből.
   * Az első találatot távolítja el a kézben lévő azonos kártyák közül.
   * @param playerId A játékos azonosítója.
   * @param card A kártya, amit el kell távolítani.
   * @returns `true`, ha a kártyát sikerült eltávolítani, `false` ha nem volt megtalálható.
   */
  public removeCardFromPlayerHand(playerId: string, card: CardData): boolean {
    const hand = this.hands[playerId];
    if (!hand) {
      this.log(`removeCardFromPlayerHand: játékos nincs regisztrálva: ${playerId}`);
      return false;
    }

    const index = hand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
    if (index === -1) {
      this.log(`removeCardFromPlayerHand: nem található a kártya: ${JSON.stringify(card)} a játékos kezében.`);
      return false;
    }

    const [removed] = hand.splice(index, 1);
    this.log(`Eltávolítva ${JSON.stringify(removed)} játékos (${playerId}) kezéből.`);

    if (this.socket) {
      this.socket.emit("handUpdate", { playerId, hand: [...hand] });
    }

    return true;
  }

  /**
   * Átrendezi a player kezében a lapokat:
   * - fromIndex-ről eltávolítja a kártyát és beilleszti toIndex pozícióba.
   */
  public reorderHand(playerId: string, fromIndex: number, toIndex: number): void {
    const hand = this.hands[playerId];
    if (!hand) throw new Error(`Player ${playerId} nincs regisztrálva!`);
    if (fromIndex < 0 || fromIndex >= hand.length || toIndex < 0 || toIndex > hand.length) {
      this.log(`reorderHand: érvénytelen fromIndex/toIndex: ${fromIndex}, ${toIndex}`);
      return;
    }
    const [card] = hand.splice(fromIndex, 1);
    hand.splice(toIndex, 0, card);
    this.log(`Player ${playerId} keze új sorrend: ${JSON.stringify(hand)}`);
  }


  /**
   * @returns minden játékos azonosítójához a kézben lévő kártyák listája
   *          és broadcast-eli is ezt a "handsUpdate" csatornán
   */
  public getHands(): Record<string, CardData[]> {
    const handsCopy = Object.fromEntries(
      Object.entries(this.hands).map(([pid, cards]) => [pid, [...cards]])
    );

    if (this.socket) {
      // broadcast minden kliensnek az aktuális kézállást
      this.socket.emit("handsUpdate", { hands: handsCopy });
    }

    return handsCopy;
  }
  /**
   * @returns egyetlen játékos aktuális kézét, és csak neki küldi el.
   * Ha nincs megadva playerId, akkor az aktuális játékos kezét adja vissza.
   */
  public getHand(playerId?: string): CardData[] {
    const id = playerId || this.getCurrentPlayer()?.id;
    if (!id) {
      console.warn("getHand: nincs érvényes játékos ID.");
      return [];
    }

    const handCopy = this.hands[id]?.slice() || [];

    if (this.socket) {
      this.socket.emit("handUpdate", { playerId: id, hand: handCopy });
    }

    return handCopy;
  }

  public setDrawPile(cards: CardData[]): void {
    this.drawPile = [...cards];
    this.log(`Húzópakli az asztalra helyezve: ${JSON.stringify(this.drawPile)}`);
    if (this.socket) {
      this.socket.emit("drawPileSet", { pile: this.drawPile });
    }
  }
  public addToDrawPile(card: CardData): void {
    this.drawPile.push(card);
    this.log(`Lap hozzáadva a húzópaklihoz: ${JSON.stringify(card)}`);
    if (this.socket) {
      this.socket.emit("drawPileUpdated", { pile: this.drawPile });
    }
  }

  public drawFromPile(): CardData | null {
    const card = this.drawPile.shift() || null;
    this.log(`Húzott lap a húzópakliból: ${JSON.stringify(card)}`);
    if (this.socket) {
      this.socket.emit("drawPileUpdated", { pile: this.drawPile });
    }
    return card;
  }
  public getDrawPile(): CardData[] {
    return [...this.drawPile];
  }

  /**
 * Beállítja az asztalon lévő kártyákat.
 * Ha nincs megadva lap, akkor a pakliból vesz egyet.
 * Felülírja az eddigi asztalon lévő kártyákat.
 */
  public setTableCards(cards?: CardData[]): void {
    if (!cards || cards.length === 0) {
      const card = this.deck.shift();
      if (!card) {
        this.log("Nincs elérhető kártya a pakliban, nem lehet kezdőlapot lerakni.");
        return;
      }
      this.tableCards = [card];
    } else {
      this.tableCards = [...cards];
    }

    this.log(`Asztali kártyák beállítva: ${JSON.stringify(this.tableCards)}`);
    this.socket?.emit("tableCardsSet", { cards: this.tableCards });
  }

  /**
   * Egy új lapot ad hozzá az asztalon lévő kártyákhoz.
   * @param card A hozzáadandó kártya.
   */
  public addTableCard(card: CardData): void {
    this.tableCards.push(card);
    this.log(`Új lap az asztalon: ${JSON.stringify(card)}`);
    this.socket?.emit("tableCardsSet", { cards: this.tableCards });
  }

    /**
   * Visszaadja az asztalon lévő kártyákat.
   * @returns Az asztalon lévő kártyák másolata.
   */
  public getTableCards(): CardData[] {
    return [...this.tableCards];
  }

    /**
   * Eltávolít minden lapot az asztalról.
   */
  public clearTableCards(): void {
    this.tableCards = [];
    this.log("Az asztalon lévő kártyák törölve.");
    this.socket?.emit("tableCardsSet", { cards: this.tableCards });
  }

  public registerCardEffect(key: string, handler: CardEffectHandler): void {
    this.cardEffects.set(key, handler);
    this.log(`Kártyahatás regisztrálva: ${key}`);
  }
  
  /**
   * Egy meglévő kártyát ad hozzá egy játékos kezéhez.
   * Ha nincs megadva playerId, akkor az aktuális játékos kapja.
   */
  public giveCardToPlayer(card: CardData, playerId?: string): void {
    const id = playerId || this.getCurrentPlayer()?.id;
    if (!id) {
      this.log("giveCardToPlayer: nincs érvényes játékos ID.");
      return;
    }

    const hand = this.hands[id];
    if (!hand) {
      this.log(`giveCardToPlayer: játékos nincs regisztrálva: ${id}`);
      return;
    }

    hand.push(card);
    this.log(`Player ${id} kapott egy lapot: ${JSON.stringify(card)}`);

    if (this.socket) {
      this.socket.emit("handUpdate", { playerId: id, hand: [...hand] });
    }
  }

  private waitForUserSelection(timeoutMs: number): Promise<string | null> {
    this.playerSelectionStatus[this.getCurrentPlayer()?.id] = false;
    const availableActions = this.getAvailableActions();
    const data = { player: this.getCurrentPlayer(), availableActions };
  
    this.socket?.emit("awaitSelection", data);
    if (this.selectionPromise) return this.selectionPromise;
  
    this.selectionPromise = new Promise<string | null>((resolve) => {
      const timer = setTimeout(() => {
        this.log("A választási idő lejárt, automatikusan továbblépünk.");
        cleanup();
        resolve(null);
      }, timeoutMs);

      const selectionHandler = (data: any) => {
        if (data?.player?.id !== this.getCurrentPlayer()?.id) return;
        const selectedValue = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
        this.log("customSelectionMade fogadva: " + selectedValue);
      
        if (this.selectionResolver) {
          this.selectionResolver(selectedValue);
        } else {
          this.log("Nem volt selectionResolver!");
        }
        cleanup();

      };
      
      this.selectionResolver = (action: string | null) => {
        clearTimeout(timer);
        const id = this.getCurrentPlayer()?.id;
        if (id) this.playerSelectionStatus[id] = true;
        resolve(action);
        cleanup();

      };
  
      const cleanup = () => {
        this.selectionPromise = null;
        this.selectionResolver = null;
        this.socket?.off("customSelectionMade", selectionHandler);
      };
  
      this.socket?.on("customSelectionMade", selectionHandler);
    });
  
    return this.selectionPromise;
  }
  
  
  /**
   * Általános célú választáskérés a játékostól.
   * Küldesz neki egy listát (pl. a kézben lévő lapokat), és megadhatsz egy függvényt, 
   * ami a választás után lefut a választott elem alapján.
   *
   * @param options A választható opciók tömbje (pl. kártyák, számok, szövegek).
   * @param onSelected Callback, ami megkapja a kiválasztott opció indexét vagy értékét.
   * @param timeoutMs (opcionális) időkorlát ezredmásodpercben. Ha nem adsz meg semmit, nincs timeout.
   */
  public async waitForSelection<T>(
    options: T[],
    onSelected: (selected: T | null, index: number | null) => void,
    timeoutMs?: number
  ): Promise<void> {

    if (!this.socket) {
      this.log("waitForSelection: nincs socket kapcsolat.");
      return;
    }

    const player = this.getCurrentPlayer();
    if (!player) {
      this.log("waitForSelection: nincs aktuális játékos.");
      return;
    }

    this.socket.emit("awaitSelection", {
      player,
      availableActions: options
    });

    return new Promise<void>((resolve) => {
      const timer = timeoutMs
        ? setTimeout(() => {
            cleanup();
            this.log("waitForSelection: időtúllépés.");
            onSelected(null, null);
            resolve();
          }, timeoutMs)
        : null;

        const selectionHandler = (data: any) => {
          if (data?.player?.id !== player.id) return;
          cleanup();
          const selectedValue = data?.value ?? null;
          const selectedIndex = selectedValue !== null
            ? options.findIndex(opt => JSON.stringify(opt) === JSON.stringify(selectedValue))
            : null;

          const maybePromise = onSelected(selectedValue, selectedIndex);
          Promise.resolve(maybePromise).then(() => {
            resolve();
          });
        };

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        this.socket.off("customSelectionMade", selectionHandler);
      };

      this.socket.on("customSelectionMade", selectionHandler);
    });
  }

  /**
   * Visszaadja a jelenlegi pakli (deck) tartalmát.
   * @returns A pakli kártyáinak másolata.
   */
  public getDeck(): CardData[] {
    return [...this.deck];
  }
  /**
   * Lekérdezi, hogy az aktuális játékos választott-e már ebben a körben.
   * @param playerId (opcionális) A játékos ID-je. Ha nincs megadva, az aktuális játékosra vonatkozik.
   * @returns `true`, ha már választott; `false`, ha még nem; `null`, ha nincs ilyen játékos.
   */
  public hasPlayerChosen(playerId?: string): boolean | null {
    const id = playerId || this.getCurrentPlayer()?.id;
    if (!id) return null;
    return this.playerSelectionStatus[id] ?? false;
  }
}

function isPromise(x: any): x is Promise<any> {
  return !!x && typeof x.then === 'function';
}