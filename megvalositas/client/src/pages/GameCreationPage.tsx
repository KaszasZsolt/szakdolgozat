import React, { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import Editor from "@monaco-editor/react";
import { useLocation } from "react-router-dom";

interface GameConfig {
  game: string;
  states: {
    [key: string]: {
      actions: { name: string; code: string }[];
      next: string | null;
    };
  };
}

interface LocationState {
  config?: string;    // Korábban elmentett konfiguráció (JSON stringként)
  gameName?: string;  // A játék neve
  gameId?: string;    // Ha szerkesztünk egy már létező játékot
}

const GameCreationPage: React.FC = () => {
  const location = useLocation();
  const { config: savedConfig, gameName: savedGameName, gameId: savedGameId } = location.state as LocationState || {};

  // Ha van mentett konfiguráció, azt használjuk; különben a default teljes konfigurációt
  const defaultConfigObj: GameConfig = {
    "game": savedGameName || "Makaó",
    "states": {
      "Setup": {
        "actions": [
          { "name": "Kártyatípusok beállítása", "code": "selectDeckType();" },
          { "name": "Kártyák száma beállítása", "code": "setCardCount();" },
          { "name": "Játékosok listája", "code": "setupPlayers();" },
          { "name": "Kezdő játékos kiválasztása", "code": "chooseStartingPlayer();" },
          { "name": "Kiosztandó lapok száma", "code": "setInitialCards();" },
          { "name": "Szabályok beállítása", "code": "configureRules();" }
        ],
        "next": "Jatekmenet"
      },
      "Jatekmenet": {
        "actions": [
          { "name": "Kezdő lap lerakása", "code": "placeStartingCard();" }
        ],
        "next": "JatekKor"
      },
      "JatekKor": {
        "actions": [
          { "name": "Laphúzás", "code": "drawCard();" },
          { "name": "Megfelelő lap lerakása", "code": "playMatchingCard();" },
          { "name": "Különleges lapok kezelése", "code": "handleSpecialCards();" },
          { "name": "\"Makaó\" bemondása", "code": "declareMacao();" },
          { "name": "Büntető lap húzása", "code": "penaltyDraw();" }
        ],
        "next": "JatekVege"
      },
      "JatekVege": {
        "actions": [
          { "name": "Pontszámok kiszámítása", "code": "calculateScores();" },
          { "name": "Kézben maradt lapok összegzése", "code": "sumRemainingCards();" },
          { "name": "10 osztás után győztes megállapítása", "code": "determineWinner();" }
        ],
        "next": null
      }
    }
  };

  // Átalakítjuk a default objektumot JSON stringgé (szép formázással)
  const defaultConfigString = savedConfig || JSON.stringify(defaultConfigObj, null, 2);

  const [config, setConfig] = useState<string>(defaultConfigString);
  const [previewConfig, setPreviewConfig] = useState<GameConfig | null>(null);
  const [mermaidCode, setMermaidCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const diagramRef = useRef<HTMLDivElement>(null);

  // Összecsukható szekciók állapota
  const [isEditorOpen, setEditorOpen] = useState(true);
  const [isPreviewOpen, setPreviewOpen] = useState(true);
  const [isMermaidCodeOpen, setMermaidCodeOpen] = useState(true);
  const [isDiagramOpen, setDiagramOpen] = useState(true);

  useEffect(() => {
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
        fontFamily: "Arial"
      }
    });
  }, []);

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

  const handleSaveConfig = () => {
    try {
      const parsedConfig: GameConfig = JSON.parse(config);
      setPreviewConfig(parsedConfig);
      setError("");

      const generatedDiagram = generateMermaid(parsedConfig);
      setMermaidCode(generatedDiagram);
    } catch (err) {
      setError("Érvénytelen JSON formátum. Kérlek ellenőrizd a konfigurációt.");
      setPreviewConfig(null);
      setMermaidCode("");
      if (diagramRef.current) {
        diagramRef.current.innerHTML = "";
      }
    }
  };

  // Új funkció: A konfiguráció mentése az adatbázisba
  const handleSaveConfigToDB = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token hiányzik.");
      return;
    }
    // A mentendő konfiguráció (JSON stringként)
    const configToSave = config;
    // Ha van gameId, akkor PUT kérés a frissítéshez, egyébként POST kérés az új játék létrehozásához
    if (savedGameId) {
      fetch(`http://localhost:3011/games/${savedGameId}/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ config: configToSave })
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error("Nem sikerült frissíteni a konfigurációt.");
          }
          // Siker esetén visszajelzés (például egy alert vagy state frissítés)
          alert("Konfiguráció sikeresen frissítve!");
        })
        .catch((err: Error) => {
          setError(err.message);
        });
    } else {
      // Új játék konfiguráció mentése
      fetch("http://localhost:3011/games/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: previewConfig?.game || "Új játék", config: configToSave })
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error("Nem sikerült elmenteni a konfigurációt.");
          }
          alert("Konfiguráció sikeresen elmentve!");
        })
        .catch((err: Error) => {
          setError(err.message);
        });
    }
  };

  // Mermaid diagram renderelése, illetve újrarenderelése, ha a szekció kinyílik
  useEffect(() => {
    if (isDiagramOpen && mermaidCode && diagramRef.current) {
      diagramRef.current.innerHTML = ""; // Korábbi diagram törlése
      mermaid
        .render("mermaidDiagram", mermaidCode)
        .then(({ svg }) => {
          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
          }
        })
        .catch((err) => {
          console.error("Mermaid render hiba:", err);
          setError("A diagram renderelése sikertelen.");
        });
    }
  }, [isDiagramOpen, mermaidCode]);

  return (
    <div className="container mx-auto p-4 text-white bg-gray-900">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center">Kártyajáték készítő</h1>
      </header>

      {/* JSON szerkesztő szekció (összecsukható) */}
      <section className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Játék Létrehozás</h2>
          <button
            className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
            onClick={() => setEditorOpen(!isEditorOpen)}
          >
            {isEditorOpen ? "⬆ Összecsukás" : "⬇ Kinyitás"}
          </button>
        </div>
        {isEditorOpen && (
          <Editor
            height="300px"
            theme="vs-dark"
            defaultLanguage="json"
            value={config}
            onChange={(value) => setConfig(value || "")}
            options={{
              minimap: { enabled: false },
              wordWrap: "on",
              tabSize: 2,
              fontSize: 14
            }}
          />
        )}
      </section>

      {/* Konfiguráció előnézet szekció (összecsukható) */}
      {previewConfig && (
        <section className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Konfiguráció Előnézet</h2>
            <button
              className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
              onClick={() => setPreviewOpen(!isPreviewOpen)}
            >
              {isPreviewOpen ? "⬆ Összecsukás" : "⬇ Kinyitás"}
            </button>
          </div>
          {isPreviewOpen && (
            <pre className="bg-gray-800 p-4 rounded overflow-auto text-sm font-mono text-white">
              {JSON.stringify(previewConfig, null, 2)}
            </pre>
          )}
        </section>
      )}

      {/* Mermaid Setup (a generált kód előnézete, összecsukható) */}
      {mermaidCode && (
        <section className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Mermaid Setup</h2>
            <button
              className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
              onClick={() => setMermaidCodeOpen(!isMermaidCodeOpen)}
            >
              {isMermaidCodeOpen ? "⬆ Összecsukás" : "⬇ Kinyitás"}
            </button>
          </div>
          {isMermaidCodeOpen && (
            <pre className="bg-gray-800 p-4 rounded overflow-auto text-sm font-mono text-white">
              {mermaidCode}
            </pre>
          )}
        </section>
      )}

      {/* Mermaid Diagram szekció (összecsukható) */}
      {mermaidCode && (
        <section className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Mermaid Diagram</h2>
            <button
              className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
              onClick={() => setDiagramOpen(!isDiagramOpen)}
            >
              {isDiagramOpen ? "⬆ Összecsukás" : "⬇ Kinyitás"}
            </button>
          </div>
          {isDiagramOpen && <div ref={diagramRef} className="bg-gray-800 p-4 rounded overflow-auto" />}
        </section>
      )}

      {/* Konfiguráció mentése gomb (lokális előnézetet is frissítjük) */}
      <div className="flex flex-col items-center gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSaveConfig}
        >
          Konfiguráció előnézet
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleSaveConfigToDB}
        >
          Mentés az adatbázisba
        </button>
      </div>
    </div>
  );
};

export default GameCreationPage;
