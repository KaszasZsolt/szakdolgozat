// src/hooks/useGameConfig.ts
import { useState, useEffect, useCallback } from "react";
import { GameConfig } from "../utils/GameEngine";

export const useGameConfig = (initialConfigString: string) => {
  const [config, setConfig] = useState<string>(initialConfigString);
  const [previewConfig, setPreviewConfig] = useState<GameConfig | null>(null);
  const [mermaidCode, setMermaidCode] = useState<string>("");
  const [error, setError] = useState<string>("");

  const generateMermaid = (jsonData: GameConfig): string => {
    let diagram = "stateDiagram-v2\n    [*] --> Setup\n";
    for (const [state, details] of Object.entries(jsonData.states)) {
      diagram += `    state ${state}\n`;
      details.actions.forEach((action, index) => {
        const actionNode = `${state}_action${index}`;
        diagram += `    ${actionNode} : ${action.name}\n`;
        diagram += `    ${state} --> ${actionNode}\n`;
      });
      if (details.next) {
        diagram += `    ${state} --> ${details.next}\n`;
      }
    }
    return diagram;
  };

  const handleSaveConfig = useCallback(() => {
    try {
      const parsedConfig: GameConfig = JSON.parse(config);
      setPreviewConfig(parsedConfig);
      setError("");
      setMermaidCode(generateMermaid(parsedConfig));
    } catch (err) {
      setError("Érvénytelen JSON formátum. Kérlek ellenőrizd a konfigurációt.");
      setPreviewConfig(null);
      setMermaidCode("");
    }
  }, [config]);

  useEffect(() => {
    handleSaveConfig();
  }, [config, handleSaveConfig]);

  return { config, setConfig, previewConfig, mermaidCode, error, handleSaveConfig };
};
