import React from "react";
import CustomJsonEditor from "../custom/CustomJsonEditor";
import { GameConfig } from "../../utils/GameEngine";

interface JsonEditorSectionProps {
  config: string;
  setConfig: (value: string) => void;
  isOpen: boolean;
  toggleOpen: () => void;
}

const JsonEditorSection: React.FC<JsonEditorSectionProps> = ({
  config,
  setConfig,
  isOpen,
  toggleOpen,
}) => {
  return (
    <section className="mt-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Szerkesztő</h2>
        <button
          className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          onClick={toggleOpen}
        >
           {isOpen ? "⬆ Összecsukás" : "⬇ Kinyitás"}
        </button>
      </div>
      {isOpen && (
        <div className="flex-grow overflow-auto mt-4">
          <CustomJsonEditor
            config={JSON.parse(config)}
            onConfigChange={(newConfig: GameConfig) =>
              setConfig(JSON.stringify(newConfig, null, 2))
            }
          />
        </div>
      )}
    </section>
  );
};

export default JsonEditorSection;
