import React from "react";
import { GameEngine } from "../../utils/GameEngine";

interface EngineTestSectionProps {
  engine: GameEngine;
  setEngine: (engine: GameEngine) => void;
}

const EngineTestSection: React.FC<EngineTestSectionProps> = ({ engine, setEngine }) => {
  return (
    <div className="mt-4 p-4 bg-gray-800 rounded">
      <h3 className="text-xl font-bold">Futásidejű Teszt</h3>
      <p>Aktuális állapot: {engine.getCurrentState()}</p>
      <p>Elérhető akciók:</p>
      <ul className="list-disc list-inside">
        {engine.getAvailableActions().map((actionName) => (
          <li key={actionName} className="mt-1">
            <button
              className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded"
              onClick={() => {
                engine.performAction(actionName);
                // Újra rendereljük, ha az engine módosul
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
          className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded"
          onClick={() => {
            engine.runOneStep();
            setEngine(Object.create(engine));
          }}
        >
          Következő állapot
        </button>
      </div>
      <p className="mt-2">
        Kattints valamelyik akcióra, illetve lépj vissza/előre az állapotok között!
      </p>
    </div>
  );
};

export default EngineTestSection;
