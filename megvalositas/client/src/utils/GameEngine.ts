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
      cyclePlayers?: boolean;
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

  constructor(config: GameConfig) {
    this.config = config;
    const className = config.game.replace(/\s+/g, "");
    if ((window as any)[className]) {
      this.gameInstance = new (window as any)[className]();
    } else {
      throw new Error("A generált játékosztály nem található. ...");
    }

    // A "kezdő állapot" beállítása
    const initialState = Object.keys(config.states)[0];
    if (!initialState) {
      throw new Error("A konfiguráció nem tartalmaz állapotokat!");
    }
    this.currentState = initialState;
    this.stateHistory.push(this.currentState);
  }

  public setPlayers(players: any[]): void {
    this.players = players;
    this.currentPlayerIndex = 0;
  }

  public getCurrentPlayer(): any {
    return this.players[this.currentPlayerIndex];
  }

  public nextPlayer(): void {
    if (this.players.length > 0) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      console.log("Következő játékos:", this.getCurrentPlayer());
    }
  }

  /**
   * Egylépéses végrehajtás:
   * - Lefut az aktuális állapot metódusa
   * - Lefutnak az abban definiált akciók
   * - Továbbállunk a next állapotra (ha van), ellenőrzi a továbblépés feltételét
   */
  public async runOneStep(): Promise<void> {
    if (this.isRunning) {
      console.warn("runOneStep már fut, megvárjuk amíg befejeződik.");
      return;
    }
    this.isRunning = true;

    try {
      if (!this.currentState) {
        console.log("A játék véget ért. Nincs több lépés.");
        return;
      }

      console.log(`Futtatom az állapotot: ${this.currentState}`);
      const stateMethod = toValidMethodName(this.currentState);
      if (typeof this.gameInstance[stateMethod] === "function") {
        this.gameInstance[stateMethod]();
      } else {
        console.warn(`Az állapot metódus "${stateMethod}" nem található.`);
      }

      const stateData = this.config.states[this.currentState];

      // Ha dönteni kell akkor várjuk a user akcióját vagy time outot
      if (stateData.enableActionSelection) {
        console.log("Választásra váró állapot. Timeout:", stateData.choiceTime ?? 0, "mp");
        const timeout = stateData.choiceTime ? stateData.choiceTime * 1000 : 0;
        const chosenAction = await this.waitForUserSelection(timeout);

        if (chosenAction) {
          console.log(`Felhasználó által kiválasztott akció: ${chosenAction}`);
          if (typeof this.gameInstance[chosenAction] === "function") {
            this.gameInstance[chosenAction]();
          } else {
            console.warn(`Az akciómetódus "${chosenAction}" nem található a gameInstance-ben.`);
          }
        } else {
          console.log("Nem történt felhasználói választás, továbblépünk akció nélkül.");
        }
      } else {
        // Ha nem decision state, akkor lefuttatjuk az összes akciót
        for (const action of stateData.actions) {
          const actionMethod = toValidMethodName(action.name);
          console.log(`Futtatom az akciót: ${action.name} (${actionMethod})`);
          if (typeof this.gameInstance[actionMethod] === "function") {
            this.gameInstance[actionMethod]();
          } else {
            console.warn(`Az akció metódus "${actionMethod}" nem található a gameInstance-ben.`);
          }
        }
      }

      if (stateData.cyclePlayers) {
        this.nextPlayer();
      }

      // Megnézzük a nextCondition-t: váltunk-e a következő állapotba?
      const conditionMethodName = toValidMethodName(this.currentState) + "NextCondition";
      let shouldTransition = true;
      if (typeof this.gameInstance[conditionMethodName] === "function") {
        shouldTransition = this.gameInstance[conditionMethodName]();
      }

      if (shouldTransition) {
        if (stateData.next === null) {
          console.log("A játék véget ért (next = null).");
          this.currentState = null;
        } else {
          console.log(`Tovább lépünk a(z) "${stateData.next}" állapotba.`);
          this.currentState = stateData.next;
          this.stateHistory.push(this.currentState);
        }
      } else {
        // Ha a nextCondition false, ellenőrizzük, hogy van-e "previous" beállítva
        if (stateData.previous) {
          console.log(`Visszalépünk a korábbi állapotra: ${stateData.previous}`);
          this.currentState = stateData.previous;
          this.stateHistory.push(this.currentState);
        } else {
          console.log("A nextCondition false, de nincs visszalépési állapot beállítva, így maradunk az aktuális állapotban:", this.currentState);
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manuális visszalépés egy korábbi állapotba
   */
  public goToPreviousState(): void {
    if (this.stateHistory.length > 1) {
      this.stateHistory.pop();
      this.currentState = this.stateHistory[this.stateHistory.length - 1];
      console.log("Visszaléptem az előző állapotra:", this.currentState);
    } else {
      console.warn("Nincs korábbi állapot, nem tudok visszalépni.");
    }
  }

  /**
   * A felhasználó által kiválasztott akció futtatása:
   * - Ha dönteni kell, akkor valójában csak beállítjuk a selectedAction-t,
   *   ami feloldja a waitForUserSelection-t.
   * - Ha nem decision state, akkor azonnal futtatjuk a metódust.
   */
  public performAction(actionName: string): void {
    if (!this.currentState) {
      console.warn("A játék véget ért, nem futtatunk több akciót.");
      return;
    }

    const stateData = this.config.states[this.currentState];
    if (stateData.enableActionSelection) {
      this.setSelectedAction(actionName);
    } else {
      // Nem kell dönteni, azonnal lefuttatjuk
      const actionMethod = actionName;
      if (typeof this.gameInstance[actionMethod] === "function") {
        console.log(`PerformAction: futtatom az akciót: ${actionMethod}`);
        this.gameInstance[actionMethod]();
      } else {
        console.warn(`Az akció metódus "${actionMethod}" nem található a gameInstance-ben.`);
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

  private waitForUserSelection(timeout: number): Promise<string | null> {
    if (!this.selectionPromise) {
      this.selectionPromise = new Promise((resolve) => {
        this.selectionResolver = resolve;
      });
    }
    return Promise.race([
      this.selectionPromise,
      new Promise<string | null>((resolve) =>
        setTimeout(() => resolve(null), timeout)
      ),
    ]).finally(() => {
      this.selectionPromise = null;
      this.selectionResolver = null;
    });
  }

  /**
   * Beállítja a felhasználó által választott akciót.
   */
  public setSelectedAction(actionName: string) {
    if (this.selectionResolver) {
      this.selectionResolver(actionName);
    }
  }
}
