import * as ts from 'typescript';

export async function transpileInBrowser(tsCode: string): Promise<string> {
  // A transpileModule egyből visszaadja a kimenő JS kódot (outputText).
  const result = ts.transpileModule(tsCode, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2015,  // vagy amit szeretnél
      module: ts.ModuleKind.ESNext
    },
  });
  return result.outputText;
}
