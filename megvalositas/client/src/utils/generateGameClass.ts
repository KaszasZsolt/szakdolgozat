import { toValidMethodName } from "./toValidMethorName";
import { baseFunctions } from "./baseFunctions";

interface GameConfig {
  game: string;
  states: {
    [key: string]: {
      actions: { name: string; code?: string }[];
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

  const usedBaseFunctions = new Set<keyof typeof baseFunctions>();

  for (const stateData of Object.values(config.states)) {
    for (const action of stateData.actions) {
      if (action.code && action.code in baseFunctions) {
        usedBaseFunctions.add(action.code as keyof typeof baseFunctions);
      }
    }
  }

  let code = `
/**
 * Generált játékosztály.
 */
class ${className} {
  constructor() {
    console.log("A(z) ${config.game} játék példánya létrejött.");
  }

  //#region ALAP FUNKCIÓK
`;

  usedBaseFunctions.forEach(funcName => {
    code += `
  /**
   * Alap funkció: ${funcName}
   */
  public ${funcName} = ${baseFunctions[funcName].func.toString()};
`;
  });

  code += `
  //#endregion
  //#region CUSTOM FUNKCIÓK
`;

  for (const [stateName, stateData] of Object.entries(config.states)) {
    code += `
  /**
   * Állapot: ${stateName}
   */
  public ${toValidMethodName(stateName)}() {
    console.log("Belépés az állapotba: ${stateName}");
  }
`;

    for (const action of stateData.actions) {
      const methodName = toValidMethodName(action.name);
      const actionCall = action.code && usedBaseFunctions.has(action.code as keyof typeof baseFunctions)  
        ? `this.${action.code}();` 
        : "";

      code += `
  /**
   * Akció: ${action.name}
   */
  public ${methodName}() {
    console.log("Fut az akció: ${toValidMethodName(action.name)}");
    ${actionCall}
  }
`;
    }
  }

  code += `
  //#endregion
} 

(window as any)["${className}"] = ${className};
`;
  return code;
}