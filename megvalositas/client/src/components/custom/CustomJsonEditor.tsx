import React from "react";
import { useState,useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface GameConfig {
  game: string;
  states: {
    [key: string]: {
      actions: { name: string; code?: string }[]; // A code nem kötelező
      next: string | null;
    };
  };
}

interface CustomJsonEditorProps {
  config: GameConfig;
  onConfigChange: (newConfig: GameConfig) => void;
  hideActionNames?: boolean; // Új: Funkciónevek elhagyhatóak
}

const CustomJsonEditor: React.FC<CustomJsonEditorProps> = ({ config, onConfigChange, hideActionNames = false }) => {
  const [editedNames, setEditedNames] = useState<{ [key: string]: string }>(
    () => Object.keys(config.states).reduce((acc, key) => ({ ...acc, [key]: key }), {})
  );

  useEffect(() => {
    setEditedNames(() =>
      Object.keys(config.states).reduce((acc, key) => {
        acc[key] = key;
        return acc;
      }, {} as { [key: string]: string })
    );
  }, [config.states]); 
  
  const handleAddState = () => {
    const stateName = prompt("Új állapot neve:");
    if (!stateName || config.states[stateName]) return;

    const stateKeys = Object.keys(config.states);
    const lastState = stateKeys.length > 0 ? stateKeys[stateKeys.length - 1] : null;

    const updatedStates = {
      ...config.states,
      [stateName]: { actions: [], next: null },
    };

    if (lastState) {
      updatedStates[lastState] = {
        ...updatedStates[lastState],
        next: stateName,
      };
    }

    onConfigChange({ ...config, states: updatedStates });

    setEditedNames((prev) => ({
      ...prev,
      [stateName]: stateName,
    }));
  };


  const handleStateNameChange = (oldName: string, newName: string) => {
    setEditedNames((prev) => ({ ...prev, [oldName]: newName }));
  };

  const handleStateNameBlur = (oldName: string, currentName: string) => {
    if (currentName.trim() === "") {
      setEditedNames((prev) => ({ ...prev, [oldName]: oldName }));
      return;
    }

    if (oldName !== currentName && !config.states[currentName]) {
      const updatedStates: GameConfig["states"] = Object.keys(config.states).reduce((acc, key) => {
        const newKey = key === oldName ? currentName : key;
        acc[newKey] = {
          ...config.states[key],
          next: config.states[key].next === oldName ? currentName : config.states[key].next,
        };
        return acc;
      }, {} as GameConfig["states"]);

      onConfigChange({ ...config, states: updatedStates });

      setEditedNames((prev) => {
        const newState = { ...prev };
        delete newState[oldName];
        newState[currentName] = currentName;
        return newState;
      });
    }
  };

  const handleDeleteState = (stateName: string) => {
    const stateKeys = Object.keys(config.states);
    const stateIndex = stateKeys.indexOf(stateName);

    if (stateIndex === -1) return;

    const updatedStates = { ...config.states };

    if (stateIndex > 0) {
      const prevState = stateKeys[stateIndex - 1];
      updatedStates[prevState] = {
        ...updatedStates[prevState],
        next: updatedStates[stateName].next,
      };
    }

    delete updatedStates[stateName];

    onConfigChange({ ...config, states: updatedStates });
  };


  const handleAddAction = (stateName: string) => {
    const actionName = prompt("Új akció neve:");
    if (!actionName) return;
    const updatedStates = { ...config.states };
    updatedStates[stateName].actions.push({ name: actionName });
    onConfigChange({ ...config, states: updatedStates });
  };

  const handleDeleteAction = (stateName: string, actionIndex: number) => {
    const updatedStates = { ...config.states };
    updatedStates[stateName].actions.splice(actionIndex, 1);
    onConfigChange({ ...config, states: updatedStates });
  };

  const handleActionChange = (stateName: string, actionIndex: number, key: "name" | "code", value: string) => {
    const updatedStates = { ...config.states };
    updatedStates[stateName].actions[actionIndex][key] = value;
    onConfigChange({ ...config, states: updatedStates });
  };

  const handleDragEnd = (event: any, type: "state" | "action", stateName?: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (type === "state") {
      const keys = Object.keys(config.states);
      const oldIndex = keys.indexOf(active.id);
      const newIndex = keys.indexOf(over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedKeys = arrayMove(keys, oldIndex, newIndex);
        const updatedStates = reorderedKeys.reduce((acc, key, idx) => {
          acc[key] = {
            ...config.states[key],
            next: idx < reorderedKeys.length - 1 ? reorderedKeys[idx + 1] : null,
          };
          return acc;
        }, {} as { [key: string]: typeof config.states[string] });

        onConfigChange({ ...config, states: updatedStates });
      }
    } else if (type === "action" && stateName) {
      const actions = config.states[stateName].actions;
      const oldIndex = actions.findIndex((_, i) => `${stateName}-${i}` === active.id);
      const newIndex = actions.findIndex((_, i) => `${stateName}-${i}` === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedStates = { ...config.states };
        updatedStates[stateName].actions = arrayMove(actions, oldIndex, newIndex);
        onConfigChange({ ...config, states: updatedStates });
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded p-3">
      <button onClick={handleAddState} className="px-3 py-1 bg-green-600 text-white rounded mb-2 text-xs">
        + Új állapot
      </button>

      <DndContext collisionDetection={closestCenter} onDragEnd={(event) => handleDragEnd(event, "state")}>
        <SortableContext items={Object.keys(config.states)} strategy={verticalListSortingStrategy}>
          {Object.entries(config.states).map(([stateName, stateData], index, arr) => (
            <SortableItem key={stateName} id={stateName}>
              <div className="border border-gray-600 p-2 mb-2 rounded bg-gray-700">
                <div className="flex justify-between items-center cursor-grab">
                  <input
                    type="text"
                    value={editedNames[stateName]}
                    onChange={(e) => handleStateNameChange(stateName, e.target.value)} // Engedjük a szerkesztést
                    onBlur={(e) => handleStateNameBlur(stateName, e.target.value)} // Fókuszvesztés után frissítünk
                    className="text-xs font-bold bg-transparent text-white border-none w-auto"
                  />
                  <button className="bg-red-500 text-white px-1 py-1 rounded text-xs" onClick={() => handleDeleteState(stateName)}>
                    ❌
                  </button>
                </div>

                <DndContext collisionDetection={closestCenter} onDragEnd={(event) => handleDragEnd(event, "action", stateName)}>
                  <SortableContext items={stateData.actions.map((_, i) => `${stateName}-${i}`)} strategy={verticalListSortingStrategy}>
                    {stateData.actions.map((action, index) => (
                      <SortableItem key={`${stateName}-${index}`} id={`${stateName}-${index}`}>
                        <div className="flex gap-1 mb-1 p-1 bg-gray-600 rounded cursor-grab">
                          {!hideActionNames && (
                            <input
                              type="text"
                              value={action.name}
                              onChange={(e) => handleActionChange(stateName, index, "name", e.target.value)}
                              className="text-xs bg-gray-700 text-white border-none flex-1 px-1 py-1 rounded w-20"
                            />
                          )}
                          <input
                            type="text"
                            value={action.code || ""}
                            onChange={(e) => handleActionChange(stateName, index, "code", e.target.value)}
                            className="text-xs bg-gray-700 text-white border-none flex-1 px-1 py-1 rounded w-28"
                            placeholder="Akció kód..."
                          />
                          <button className="text-red-400 text-xs" onClick={() => handleDeleteAction(stateName, index)}>
                            ❌
                          </button>
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>

                <button className="mt-1 bg-blue-500 px-2 py-1 text-xs rounded text-white" onClick={() => handleAddAction(stateName)}>
                  + Akció
                </button>

                {index < arr.length - 1 && (
                  <div className="text-center text-gray-400 text-xs mt-1">↓ {arr[index + 1][0]} ↓</div>
                )}
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

// Komponens a rendezhető elemekhez
const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span {...listeners} style={{ cursor: "grab", marginRight: "0.5rem" }}>
          ☰
        </span>
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );

};

export default CustomJsonEditor;
