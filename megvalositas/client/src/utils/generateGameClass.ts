import { toValidMethodName } from "./toValidMethorName";

interface GameConfig {
  game: string;
  states: {
    [key: string]: {
      actions: { name: string; code: string }[];
      next: string | null;
    };
  };
}

/**
 * Ez a függvény a megadott JSON konfiguráció alapján
 * legenerálja a játékclass TypeScript kódját (export nélkül!).
 */
export function generateGameClassFromConfig(config: GameConfig): string {
  const className = config.game.replace(/\s+/g, "");

  // -- A class-t NEM exportáljuk! 
  let code = `
/**
 * Ezt a kódot a JSON konfiguráció alapján generáltuk.
 * A class tartalmazza a játék állapotait és a hozzájuk tartozó action-öket.
 * Figyelem: NINCS 'export class', mert a globális scope-ba akarjuk regisztrálni eval-lal.
 */
class ${className} {
  constructor() {
    // Inicializálás, ha szükséges
    console.log("A(z) ${config.game} játék példánya létrejött.");
  }
`;

  for (const [stateName, stateData] of Object.entries(config.states)) {
    code += `
  /**
   * [State] ${stateName}
   */
  public ${toValidMethodName(stateName)}() {
    // TODO: Implement '${stateName}' állapot logikája
  }
`;
    for (const action of stateData.actions) {
      const methodName = toValidMethodName(action.name);
      code += `
  /**
   * Action: ${action.name}
   */
  public ${methodName}() {
    // TODO: Implement '${action.name}'
  }
`;
    }
  }

  // A végén a class-t ráírjuk a window objektumra, így a GameEngine látni fogja:
  code += `
} // <-- class vége

(window as any)["${className}"] = ${className};
`;

  return code;
}