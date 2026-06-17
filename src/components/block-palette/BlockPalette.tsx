import { BLOCK_DEFINITIONS } from "../../data/blockDefinitions";
import { useExecutionStore } from "../../stores/executionStore";
import { useProgramStore } from "../../stores/programStore";
import { useShapeStore } from "../../stores/shapeStore";

export const BlockPalette = () => {
  const shapes = useShapeStore((state) => state.shapes);
  const selectedShapeId = useShapeStore((state) => state.selectedShapeId);

  const addMoveBlock = useProgramStore((state) => state.addMoveBlock);

  const addRotateBlock = useProgramStore((state) => state.addRotateBlock);

  const addChangeColorBlock = useProgramStore(
    (state) => state.addChangeColorBlock,
  );

  const addRepeatBlock = useProgramStore((state) => state.addRepeatBlock);

  const clearExecution = useExecutionStore((state) => state.clearExecution);

  const defaultTargetShapeId = selectedShapeId ?? shapes[0]?.id ?? null;

  const handleAddBlock = (type: (typeof BLOCK_DEFINITIONS)[number]["type"]) => {
    if (type === "repeat") {
      addRepeatBlock();
      clearExecution();
      return;
    }

    if (!defaultTargetShapeId) {
      window.alert("먼저 도형을 만들어 주세요.");
      return;
    }

    if (type === "move") {
      addMoveBlock(defaultTargetShapeId);
    } else if (type === "rotate") {
      addRotateBlock(defaultTargetShapeId);
    } else {
      addChangeColorBlock(defaultTargetShapeId);
    }

    clearExecution();
  };

  return (
    <section className="panel">
      <div className="panel__header">
        <h2 className="panel__title">블록</h2>
      </div>

      <div className="block-palette">
        {BLOCK_DEFINITIONS.map((definition) => (
          <button
            key={definition.type}
            className={`block-card ${definition.className}`}
            type="button"
            title={definition.description}
            aria-label={`${definition.title}: ${definition.description}`}
            onClick={() => handleAddBlock(definition.type)}
          >
            <strong>{definition.title}</strong>
          </button>
        ))}
      </div>
    </section>
  );
};
