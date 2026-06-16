import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useExecutionStore } from "../../stores/executionStore";
import { useProgramStore } from "../../stores/programStore";
import { useShapeStore } from "../../stores/shapeStore";
import type { MoveDirection, ProgramBlock } from "../../types/block";
import type { Shape } from "../../types/shape";

const SHAPE_COLORS = [
  "#0091ff",
  "#55baff",
  "#35c5d0",
  "#42b883",
  "#f0bd4e",
  "#ee7eaa",
  "#6f78e8",
  "#8799a7",
];

type UpdateBlock = (id: string, changes: Partial<ProgramBlock>) => void;

interface SortableProgramBlockProps {
  block: ProgramBlock;
  index: number;
  shapes: Shape[];
  isActive: boolean;
  updateBlock: UpdateBlock;
  removeBlock: (id: string) => void;
}

const getBlockTitle = (block: ProgramBlock) => {
  switch (block.type) {
    case "move":
      return "이동";

    case "rotate":
      return "회전";

    case "changeColor":
      return "색상 변경";

    case "repeat":
      return "반복";
  }
};

const getShapeTypeName = (shape: Shape) => {
  switch (shape.type) {
    case "rectangle":
      return "사각형";

    case "circle":
      return "원";

    case "triangle":
      return "삼각형";
  }
};

const SortableProgramBlock = ({
  block,
  index,
  shapes,
  isActive,
  updateBlock,
  removeBlock,
}: SortableProgramBlockProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
  });

  const selectedShape =
    block.type !== "repeat"
      ? shapes.find((shape) => shape.id === block.targetShapeId)
      : null;

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`program-block program-block--${block.type} ${
        isActive ? "program-block--active" : ""
      } ${isDragging ? "program-block--dragging" : ""}`}
      title="블록을 드래그하여 순서를 변경할 수 있어요."
      {...attributes}
      {...listeners}
    >
      <div className="program-block__number">{index + 1}</div>

      <div className="program-block__content">
        <div className="program-block__header">
          <strong>{getBlockTitle(block)}</strong>

          <button
            className="program-block__remove"
            type="button"
            aria-label={`${index + 1}번째 블록 삭제`}
            onClick={() => removeBlock(block.id)}
          >
            ×
          </button>
        </div>

        <div className="program-block__fields">
          {block.type !== "repeat" && (
            <div className="shape-select">
              <span
                className={`shape-select__swatch ${
                  selectedShape?.type === "circle"
                    ? "shape-select__swatch--circle"
                    : selectedShape?.type === "triangle"
                      ? "shape-select__swatch--triangle"
                      : ""
                }`}
                style={{
                  backgroundColor:
                    selectedShape?.type === "triangle"
                      ? "transparent"
                      : selectedShape?.color,
                  color: selectedShape?.color ?? "var(--color-primary)",
                }}
                aria-hidden="true"
              />

              <select
                className="block-control shape-select__control"
                value={block.targetShapeId}
                aria-label="명령을 실행할 도형 선택"
                onChange={(event) =>
                  updateBlock(block.id, {
                    targetShapeId: event.target.value,
                  })
                }
              >
                {shapes.map((shape) => (
                  <option key={shape.id} value={shape.id}>
                    {shape.name} · {getShapeTypeName(shape)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {block.type === "move" && (
            <>
              <span>도형을</span>

              <select
                className="block-control"
                value={block.direction}
                onChange={(event) =>
                  updateBlock(block.id, {
                    direction: event.target.value as MoveDirection,
                  })
                }
              >
                <option value="left">왼쪽으로</option>
                <option value="right">오른쪽으로</option>
                <option value="up">위로</option>
                <option value="down">아래로</option>
              </select>

              <input
                className="block-control block-control--number"
                type="number"
                min="0"
                value={block.distance}
                onChange={(event) =>
                  updateBlock(block.id, {
                    distance: Math.max(0, Number(event.target.value)),
                  })
                }
              />

              <span>만큼 이동</span>
            </>
          )}

          {block.type === "rotate" && (
            <>
              <span>도형을</span>

              <input
                className="block-control block-control--number"
                type="number"
                value={block.angle}
                onChange={(event) =>
                  updateBlock(block.id, {
                    angle: Number(event.target.value),
                  })
                }
              />

              <span>도 회전</span>
            </>
          )}

          {block.type === "changeColor" && (
            <>
              <span>도형의 색상을</span>

              <div className="block-color-options">
                {SHAPE_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`block-color-option ${
                      block.color === color
                        ? "block-color-option--selected"
                        : ""
                    }`}
                    type="button"
                    aria-label={`${color} 색상 선택`}
                    style={{
                      backgroundColor: color,
                    }}
                    onClick={() =>
                      updateBlock(block.id, {
                        color,
                      })
                    }
                  />
                ))}
              </div>

              <span>으로 변경</span>
            </>
          )}

          {block.type === "repeat" && (
            <>
              <span>바로 위 명령을</span>

              <input
                className="block-control block-control--number"
                type="number"
                min="1"
                max="100"
                value={block.count}
                onChange={(event) => {
                  const nextCount = Number(event.target.value);

                  updateBlock(block.id, {
                    count: Number.isFinite(nextCount)
                      ? Math.min(100, Math.max(1, nextCount))
                      : 1,
                  });
                }}
              />

              <span>번 반복</span>
            </>
          )}
        </div>
      </div>
    </li>
  );
};

export const ProgramWorkspace = () => {
  const blocks = useProgramStore((state) => state.blocks);
  const updateBlock = useProgramStore((state) => state.updateBlock);
  const reorderBlocks = useProgramStore((state) => state.reorderBlocks);
  const removeBlock = useProgramStore((state) => state.removeBlock);
  const clearProgram = useProgramStore((state) => state.clearProgram);

  const shapes = useShapeStore((state) => state.shapes);

  const activeBlockIndex = useExecutionStore((state) => state.activeBlockIndex);

  const clearExecution = useExecutionStore((state) => state.clearExecution);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    reorderBlocks(String(active.id), String(over.id));

    clearExecution();
  };

  const handleClearProgram = () => {
    clearProgram();
    clearExecution();
  };

  return (
    <section className="panel workspace-panel">
      <div className="panel__header">
        <h2 className="panel__title">프로그램</h2>

        <div className="workspace-panel__actions">
          <span className="panel__count">{blocks.length}</span>

          {blocks.length > 0 && (
            <button
              className="workspace-clear-button"
              type="button"
              onClick={handleClearProgram}
            >
              전체 삭제
            </button>
          )}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="workspace-panel__empty">
          <p className="panel__description">
            왼쪽의 블록을 선택해 프로그램을 만들어 보세요.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className="program-block-list">
              {blocks.map((block, index) => (
                <SortableProgramBlock
                  key={block.id}
                  block={block}
                  index={index}
                  shapes={shapes}
                  isActive={activeBlockIndex === index}
                  updateBlock={updateBlock}
                  removeBlock={removeBlock}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
};
