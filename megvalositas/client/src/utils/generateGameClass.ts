import { toValidMethodName } from "./toValidMethorName";
import { GameConfig } from "./GameEngine";
import generatedBaseDts from './GeneratedGameBase.d.ts?raw';


function parseBuiltinFunctions(dts: string): string[] {
  const re = /^\s*([A-Za-z0-9_]+)\s*\([^)]*\)\s*:/gm;
  const names = new Set<string>();
  let m;
  while ((m = re.exec(dts)) !== null) {
    const name = m[1];
    if (name !== 'constructor' && name !== 'declare' && name !== 'class') {
      names.add(name);
    }
  }
  return Array.from(names);
}


function parseDescriptions(dts: string): Record<string, string> {
  const map: Record<string, string> = {};
  const reDoc = /\/\*\*([\s\S]*?)\*\/\s*([A-Za-z0-9_]+)\s*\(/gm;
  let m;
  while ((m = reDoc.exec(dts)) !== null) {
    const rawComment = m[1];
    const methodName = m[2];
    const comment = rawComment
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, '').trim())
      .join(' ');
    map[methodName] = comment;
  }
  return map;
}

/**
 * Ez a függvény a megadott JSON konfiguráció alapján
 * legenerálja a játékclass TypeScript kódját (export nélkül!).
 */
export function generateGameClassFromConfig(config: GameConfig): string {
  const className = config.game.replace(/\s+/g, "");
  const builtin = parseBuiltinFunctions(generatedBaseDts);
  const descriptions = parseDescriptions(generatedBaseDts);

  let code = `
/**
 * Generált játékosztály.
 */
class ${className} extends GeneratedGameBase {
  constructor() {
    super();
    console.log("A(z) ${config.game} játék példánya létrejött.");
  }

  //#region CUSTOM STATE METHODS
`;

  Object.entries(config.states).forEach(([stateName, stateData]) => {
    const stateMethod = toValidMethodName(stateName);
    code += `
  /**
   * State: ${stateName}
   */
  public ${stateMethod}() {
    console.log("Belépés az állapotba: ${stateName}");
  }
`;

    stateData.actions.forEach(action => {
      const actionMethod = toValidMethodName(action.name);
      const builtinName = action.code && builtin.includes(action.code) ? action.code : null;
      const call = builtinName ? `    super.${builtinName}();` : '';
      const desc = builtinName ? descriptions[builtinName] : `Nincs ilyen akció: "${action.name}"`;

      code += `
  /**
   * Akció: ${action.name}
   * ${builtinName ? desc : ''}
   */
  public ${actionMethod}() {
    console.log("Fut az akció: ${actionMethod}");
${call}\n  }
`;
    });
  });

  code += `
  //#endregion
  //#region NEXT STATE CONDITIONS
`;
  Object.keys(config.states).forEach(stateName => {
    const condMethod = toValidMethodName(stateName) + 'NextCondition';
    code += `
  /**
   * Feltétel a(z) "${stateName}" állapotból a következő állapotba lépéshez.
   * Itt add meg, hogy mikor térjen át a játék a következő állapotra.
   */
  public ${condMethod}(): boolean {
    // TODO: Implementáld a logikát.
    return true;
  }
`;
  });
  code += `
  //#endregion
}

(window as any)["${className}"] = ${className};
`;
  return code;
}