import { BLOCK_DEFINITIONS } from "../../data/blockDefinitions";
import { useProgramStore } from "../../stores/programStore";
import { useShapeStore } from "../../stores/shapeStore";

export const BlockPalette = () => {
  const shapes = useShapeStore((state) => state.shapes);
  const selectedShapeId = useShapeStore((state) => state.selectedShapeId);

  const blocks = useProgramStore((state) => state.blocks);

  const addMoveBlock = useProgramStore((state) => state.addMoveBlock);
  const addRotateBlock = useProgramStore((state) => state.addRotateBlock);
  const addChangeColorBlock = useProgramStore(
    (state) => state.addChangeColorBlock,
  );
  const addRepeatBlock = useProgramStore((state) => state.addRepeatBlock);

  const defaultTargetShapeId = selectedShapeId ?? shapes[0]?.id ?? null;

  const handleAddBlock = (type: (typeof BLOCK_DEFINITIONS)[number]["type"]) => {
    if (type === "repeat") {
      if (blocks.length === 0) {
        window.alert("먼저 반복할 명령 블록을 추가해 주세요.");
        return;
      }

      const previousBlock = blocks[blocks.length - 1];

      if (previousBlock.type === "repeat") {
        window.alert("반복 블록 바로 다음에는 반복 블록을 추가할 수 없어요.");
        return;
      }

      addRepeatBlock();
      return;
    }

    if (!defaultTargetShapeId) {
      window.alert("먼저 도형을 만들어 주세요.");
      return;
    }

    if (type === "move") {
      addMoveBlock(defaultTargetShapeId);
      return;
    }

    if (type === "rotate") {
      addRotateBlock(defaultTargetShapeId);
      return;
    }

    addChangeColorBlock(defaultTargetShapeId);
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
