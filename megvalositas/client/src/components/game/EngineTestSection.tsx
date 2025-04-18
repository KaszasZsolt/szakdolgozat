import React, { useState, useRef, useEffect } from "react";
import { GameEngine, GameConfig } from "../../utils/GameEngine";

interface EngineTestSectionProps {
  engine: GameEngine;
  setEngine: (engine: GameEngine) => void;
  previewConfig: GameConfig;
}

const EngineTestSection: React.FC<EngineTestSectionProps> = ({ engine, setEngine, previewConfig }) => {
  const [autoRunning, setAutoRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [logs, setLogs] = useState<string[]>([]);

  // Console log a helyi változatba is
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      const message = args.map((arg) => String(arg)).join(" ");
      setLogs((prev) => [...prev, message]);
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const startAutoTest = () => {
    setAutoRunning(true);
    intervalRef.current = setInterval(() => {
      if (!engine.getCurrentState()) {
        stopAutoTest();
        return;
      }
      engine.runOneStep();
      setEngine(Object.create(engine));
    }, 1000);
  };

  const stopAutoTest = () => {
    setAutoRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const resetEngine = () => {
    stopAutoTest();
    const newEngine = new GameEngine(previewConfig);
    setEngine(newEngine);
  };

  // log törlése
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded">
      <h3 className="text-xl font-bold">Játék tesztelése</h3>
      <p>Aktuális állapot: {engine.getCurrentState()}</p>
      <p>Elérhető akciók:</p>
      <ul className="list-disc list-inside">
        {engine.getAvailableActions().map((actionName) => (
          <li key={actionName} className="mt-1">
            <button
              className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded"
              onClick={() => {
                engine.performAction(actionName);
                setEngine(Object.create(engine));
              }}
            >
              {actionName}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-row items-center mt-4">
        <button
          className="bg-yellow-600 hover:bg-yellow-500 px-2 py-1 rounded mr-2"
          onClick={() => {
            engine.goToPreviousState();
            setEngine(Object.create(engine));
          }}
        >
          Előző állapot
        </button>
        <button
          className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded mr-2"
          onClick={() => {
            engine.runOneStep();
            setEngine(Object.create(engine));
          }}
        >
          Következő állapot
        </button>
        {!autoRunning ? (
          <button
            className="bg-indigo-600 hover:bg-indigo-500 px-2 py-1 rounded"
            onClick={startAutoTest}
          >
            Automata futtatás
          </button>
        ) : (
          <button
            className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded"
            onClick={stopAutoTest}
          >
            Automata leállítás
          </button>
        )}
        {/* Reset gomb */}
        <button
          className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded ml-2"
          onClick={resetEngine}
        >
          Alaphelyzetbe állítás
        </button>

        {/*Log törlése gomb */}
        <button
          className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded ml-2"
          onClick={clearLogs}
        >
          Log törlése
        </button>
      </div>

      <p className="mt-2">
        Kattints valamelyik akcióra, illetve lépj vissza/előre az állapotok között!
      </p>

      {/* Üzeneteket megjelenítő doboz */}
      <div className="mt-4 bg-gray-700 p-2 rounded max-h-40 overflow-auto">
        {logs.map((line, idx) => (
          <div key={idx} className="text-white text-sm whitespace-pre-wrap">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngineTestSection;
