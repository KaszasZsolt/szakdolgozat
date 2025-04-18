import { toValidMethodName } from "./toValidMethorName";

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
    if (this.socket) {
      this.socket.emit("log", message);
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

  public setPlayers(players: any[]): void {
    this.players = players;
    this.currentPlayerIndex = 0;
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
    
    console.log('gdb621','forward' );
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
        this.gameInstance[stateMethod]();
      } else {
        this.log(`Az állapot metódus "${stateMethod}" nem található.`);
      }

      const stateData = this.config.states[this.currentState];

      // Ha dönteni kell akkor várjuk a user akcióját vagy time outot
      if (stateData.enableActionSelection) {
        this.log("Választásra váró állapot. Timeout: " + (stateData.choiceTime ?? 0) + " mp");
        const timeout = stateData.choiceTime ? stateData.choiceTime * 1000 : 0;
        const chosenAction = await this.waitForUserSelection(timeout);

        if (chosenAction) {
          this.log(`Felhasználó által kiválasztott akció: ${chosenAction}`);
          if (this.socket) {
            this.socket.emit("actionSelected", { action: chosenAction, player: this.getCurrentPlayer() });
          }
          if (typeof this.gameInstance[chosenAction] === "function") {
            this.gameInstance[chosenAction]();
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
        this.emit("stateChanged", { state:this.currentState});
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

  private waitForUserSelection(timeoutMs: number): Promise<string | null> {
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
  
      this.selectionResolver = (action: string | null) => {
        clearTimeout(timer);          // <‑‑ itt töröljük a timeoutot
        cleanup();
        resolve(action);
      };
  
      const cleanup = () => {
        this.selectionPromise = null;
        this.selectionResolver = null;
      };
    });
  
    return this.selectionPromise;
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
}
