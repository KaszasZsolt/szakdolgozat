import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import mermaid from "mermaid";
import BaseGameplaySection from "../components/game/BaseGameplaySection";
import GameplayFunctionsSection from "../components/game/GameplayFunctionsSection";
import GameSaveSection from "../components/game/GameSaveSection";
import EngineTestSection from "../components/game/EngineTestSection";
import { useGameConfig } from "../hooks/useGameConfig";
import { GameEngine, GameConfig } from "../utils/GameEngine";

interface LocationState {
  config?: string;
  gameName?: string;
  gameId?: string;
}

const GameCreationPage: React.FC = () => {
  const location = useLocation();
  const { config: savedConfig, gameName: savedGameName, gameId: savedGameId } =
    (location.state as LocationState) || {};

  const [gameId, setGameId] = useState<string | null>(savedGameId || null);

  // Alapértelmezett konfiguráció, ha nincs mentett
  const defaultConfigObj: GameConfig = {
    game: savedGameName || "Teszt",
    states: {
      Setup: {
        actions: [
          { name: "Kártyatípusok beállítása", code: "selectDeckType();" },
          { name: "Kártyák száma beállítása", code: "setCardCount();" },
          { name: "Játékosok listája", code: "setupPlayers();" },
          { name: "Kezdő játékos kiválasztása", code: "chooseStartingPlayer();" },
          { name: "Kiosztandó lapok száma", code: "setInitialCards();" },
          { name: "Szabályok beállítása", code: "configureRules();" },
        ],
        next: "Jatekmenet",
      },
      Jatekmenet: {
        actions: [{ name: "Kezdő lap lerakása", code: "placeStartingCard();" }],
        next: "JatekKor",
      },
      JatekKor: {
        actions: [
          { name: "Laphúzás", code: "drawCard();" },
          { name: "Megfelelő lap lerakása", code: "playMatchingCard();" },
          { name: "Különleges lapok kezelése", code: "handleSpecialCards();" },
          { name: "\"Makaó\" bemondása", code: "declareMacao();" },
          { name: "Büntető lap húzása", code: "penaltyDraw();" },
        ],
        next: "JatekVege",
      },
      JatekVege: {
        actions: [
          { name: "Pontszámok kiszámítása", code: "calculateScores();" },
          { name: "Kézben maradt lapok összegzése", code: "sumRemainingCards();" },
          { name: "10 osztás után győztes megállapítása", code: "determineWinner();" },
        ],
        next: null,
      },
    },
  };

  let defaultConfigString: string;
  let initialGeneratedCode: string = "";
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      if (parsed.config) {
        defaultConfigString = JSON.stringify(parsed.config, null, 2);
      } else {
        defaultConfigString = savedConfig;
      }
      if (parsed.code) {
        initialGeneratedCode = parsed.code;
      }
    } catch (e) {
      defaultConfigString = savedConfig;
    }
  } else {
    defaultConfigString = JSON.stringify(defaultConfigObj, null, 2);
  }

  const { config, setConfig, previewConfig, mermaidCode, error } = useGameConfig(
    defaultConfigString
  );

  // UI-szekciók nyitottsága
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [isMermaidCodeOpen, setMermaidCodeOpen] = useState(false);
  const [isDiagramOpen, setDiagramOpen] = useState(false);
  const [isJsonEditorOpen, setJsonEditorOpen] = useState(true);
  const [isMainSectionOpen, setMainSectionOpen] = useState(true);

  // Játékmenet funkciók és GameEngine
  const [generatedCode, setGeneratedCode] = useState<string>(initialGeneratedCode);
  const [engine, setEngine] = useState<GameEngine | null>(null);

  // Mermaid inicializálása
  React.useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        primaryColor: "#000000",
        primaryTextColor: "#FFFFFF",
        primaryBorderColor: "#FFFFFF",
        edgeLabelBackground: "#000000",
        edgeColor: "#FFFFFF",
        fontSize: "16px",
        fontFamily: "Arial",
      },
    });
  }, []);

  return (
    <div className="container mx-auto p-4 text-white bg-gray-900">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center">Kártyajáték készítő</h1>
      </header>

      {/* Alap konfiguráció szerkesztése, szöveges és diagramos felületen */}
      <BaseGameplaySection
        config={config}
        setConfig={setConfig}
        previewConfig={previewConfig}
        mermaidCode={mermaidCode}
        isEditorOpen={isEditorOpen}
        toggleEditor={() => setEditorOpen(!isEditorOpen)}
        isPreviewOpen={isPreviewOpen}
        togglePreview={() => setPreviewOpen(!isPreviewOpen)}
        isMermaidCodeOpen={isMermaidCodeOpen}
        toggleMermaidCode={() => setMermaidCodeOpen(!isMermaidCodeOpen)}
        isDiagramOpen={isDiagramOpen}
        toggleDiagram={() => setDiagramOpen(!isDiagramOpen)}
        isJsonEditorOpen={isJsonEditorOpen}
        toggleJsonEditor={() => setJsonEditorOpen(!isJsonEditorOpen)}
        isMainSectionOpen={isMainSectionOpen}
        toggleMainSectionOpen={() => setMainSectionOpen(!isMainSectionOpen)}
      />

      <GameplayFunctionsSection
        previewConfig={previewConfig}
        generatedCode={generatedCode}
        setGeneratedCode={setGeneratedCode}
        setEngine={setEngine}
      />

      {/* EngineTestSection beillesztése, ha van engine */}
      {engine && <EngineTestSection engine={engine} setEngine={setEngine} />}

      <GameSaveSection
        previewConfig={previewConfig}
        generatedCode={generatedCode}
        gameId={gameId}
        setGameId={setGameId}
      />

      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
};

export default GameCreationPage;
