import { GameEngine } from "./GameEngine";

export class GeneratedGameBase {
  protected engine?: GameEngine;

  constructor() {
    console.log("GeneratedGameBase konstruktor");
  }
  
  public setEngine(engine: GameEngine): void {
    this.engine = engine;
  }

  /**
   * A játékot a következő játékosra lépteti a megadott irányban.
   * @param direction Az irány, amelyben a következő játékosra lépünk. Alapértelmezett: 'forward'.
   * @remarks Ha az `engine` nincs beállítva, figyelmeztetést ír a konzolra.
   * @example
   * ```typescript
   * game.nextPlayer(); // Következő játékos előre.
   * game.nextPlayer('backward'); // Előző játékos hátra.
   * ```
   */
  public nextPlayer(direction: 'forward' | 'backward' = 'forward'): void {
    if (this.engine) {
      this.engine.nextPlayer(direction);
    } else {
      console.warn("A GameEngine nincs beállítva!");
    }
  }
}
