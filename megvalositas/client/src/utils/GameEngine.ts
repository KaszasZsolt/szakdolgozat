import { toValidMethodName } from "./toValidMethorName";

export interface GameConfig {
  game: string;
  states: {
    [key: string]: {
      actions: { name: string; code: string }[];
      next: string | null;
    };
  };
}

export class GameEngine {
  private gameInstance: any;
  private config: GameConfig;

  // Az éppen aktuális állapot
  private currentState: string;
  // A history egy tömb, amiben sorban tároljuk, hogy mely állapotokat jártunk be
  private stateHistory: string[] = [];

  constructor(config: GameConfig) {
    this.config = config;
    const className = config.game.replace(/\s+/g, "");
    if ((window as any)[className]) {
      this.gameInstance = new (window as any)[className]();
    } else {
      throw new Error("A generált játékosztály nem található. ...");
    }

    // A "kezdő állapot" beállítása
    const initialState =
      config.states["Setup"] !== undefined
        ? "Setup"
        : Object.keys(config.states)[0];

    this.currentState = initialState;
    // Betesszük a history-be az első állapotot
    this.stateHistory.push(this.currentState);
  }

  /**
   * Egylépéses végrehajtás:
   * - Lefut az aktuális állapot metódusa
   * - Lefutnak az abban definiált akciók
   * - Továbbállunk a next állapotra (ha van)
   */
  public runOneStep(): void {
    if (!this.currentState) {
      console.log("A játék véget ért.");
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
    for (const action of stateData.actions) {
      const actionMethod = toValidMethodName(action.name);
      console.log(`Futtatom az akciót: ${action.name} (${actionMethod})`);
      if (typeof this.gameInstance[actionMethod] === "function") {
        this.gameInstance[actionMethod]();
      } else {
        console.warn(`Az akció metódus "${actionMethod}" nem található.`);
      }
    }

    // Átlépés a következő állapotra (ha van)
    this.currentState = stateData.next || "";
    if (this.currentState) {
      this.stateHistory.push(this.currentState);
    } else {
      console.log("A játék véget ért.");
    }
  }

  /**
   * Visszalépés az előző állapotba
   */
  public goToPreviousState(): void {
    // Ha legalább 2 állapot van a historyban (a mostani és előtte egy)
    if (this.stateHistory.length > 1) {
      // Levesszük a legutolsó (aktuális) állapotot
      this.stateHistory.pop();
      // Az új utolsó lesz az előző állapot
      this.currentState = this.stateHistory[this.stateHistory.length - 1];
      console.log("Visszaléptem az előző állapotra:", this.currentState);
    } else {
      console.warn("Nincs korábbi állapot, nem tudok visszalépni.");
    }
  }

  public getCurrentState(): string {
    return this.currentState;
  }

  public getAvailableActions(): string[] {
    if (!this.currentState) return [];
    const stateData = this.config.states[this.currentState];
    return stateData.actions.map((action) => toValidMethodName(action.name));
  }

  public performAction(actionName: string): void {
    if (typeof this.gameInstance[actionName] === "function") {
      console.log(`Futtatom az akciót: ${actionName}`);
      this.gameInstance[actionName]();
    } else {
      console.warn(`Az akció metódus "${actionName}" nem található.`);
    }
  }
}
