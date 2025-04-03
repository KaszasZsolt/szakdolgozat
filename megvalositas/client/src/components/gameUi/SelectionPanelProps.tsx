import React from "react";

export interface SelectionPanelProps {
  availableActions: string[];
  onSelect: (action: string) => void;
}

export const SelectionPanel: React.FC<SelectionPanelProps> = ({ availableActions, onSelect }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 p-6 rounded">
        <h2 className="text-xl text-white mb-4">Válaszd ki a műveletet:</h2>
        <div className="flex flex-col gap-2">
          {availableActions.map((action) => (
            <button
              key={action}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              onClick={() => onSelect(action)}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
