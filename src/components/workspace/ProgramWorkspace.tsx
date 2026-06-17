import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
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
import type { CSSProperties } from "react";

import { useExecutionStore } from "../../stores/executionStore";
import {
  countProgramBlocks,
  getBlockParentId,
  useProgramStore,
} from "../../stores/programStore";
import { useShapeStore } from "../../stores/shapeStore";
import type { MoveDirection, ProgramBlock } from "../../types/block";
import type { Shape } from "../../types/shape";

const ROOT_CONTAINER_ID = "root";
const CONTAINER_PREFIX = "container:";

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

interface ProgramBlockListProps {
  blocks: ProgramBlock[];
  parentId: string;
  depth: number;
  shapes: Shape[];
  activeBlockId: string | null;
  updateBlock: UpdateBlock;
  removeBlock: (id: string) => void;
}

interface SortableProgramBlockProps {
  block: ProgramBlock;
  index: number;
  depth: number;
  shapes: Shape[];
  activeBlockId: string | null;
  updateBlock: UpdateBlock;
  removeBlock: (id: string) => void;
}

const getContainerId = (parentId: string) => `${CONTAINER_PREFIX}${parentId}`;

const parseContainerId = (id: string) =>
  id.startsWith(CONTAINER_PREFIX) ? id.slice(CONTAINER_PREFIX.length) : null;

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

const ProgramBlockList = ({
  blocks,
  parentId,
  depth,
  shapes,
  activeBlockId,
  updateBlock,
  removeBlock,
}: ProgramBlockListProps) => {
  const containerId = getContainerId(parentId);

  const { setNodeRef, isOver } = useDroppable({
    id: containerId,
  });

  return (
    <ol
      ref={setNodeRef}
      className={`program-block-list ${
        depth > 0 ? "program-block-list--nested" : ""
      } ${isOver ? "program-block-list--over" : ""}`}
    >
      {blocks.length === 0 && depth > 0 && (
        <li className="repeat-block__empty">
          블록을 이 안으로 드래그해 주세요.
        </li>
      )}

      <SortableContext
        items={blocks.map((block) => block.id)}
        strategy={verticalListSortingStrategy}
      >
        {blocks.map((block, index) => (
          <SortableProgramBlock
            key={block.id}
            block={block}
            index={index}
            depth={depth}
            shapes={shapes}
            activeBlockId={activeBlockId}
            updateBlock={updateBlock}
            removeBlock={removeBlock}
          />
        ))}
      </SortableContext>
    </ol>
  );
};

const SortableProgramBlock = ({
  block,
  index,
  depth,
  shapes,
  activeBlockId,
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

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  const stopDragPropagation = (
    event: React.PointerEvent | React.MouseEvent | React.TouchEvent,
  ) => {
    event.stopPropagation();
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`program-block program-block--${block.type} ${
        activeBlockId === block.id ? "program-block--active" : ""
      } ${isDragging ? "program-block--dragging" : ""}`}
      data-depth={depth}
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
            aria-label={`${getBlockTitle(block)} 블록 삭제`}
            onPointerDown={stopDragPropagation}
            onClick={(event) => {
              event.stopPropagation();
              removeBlock(block.id);
            }}
          >
            ×
          </button>
        </div>

        <div
          className="program-block__fields"
          onPointerDown={stopDragPropagation}
        >
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
              <span>내부 명령을</span>

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

        {block.type === "repeat" && (
          <div className="repeat-block__body">
            <div className="repeat-block__label">반복 범위</div>

            <ProgramBlockList
              blocks={block.children}
              parentId={block.id}
              depth={depth + 1}
              shapes={shapes}
              activeBlockId={activeBlockId}
              updateBlock={updateBlock}
              removeBlock={removeBlock}
            />
          </div>
        )}
      </div>
    </li>
  );
};

export const ProgramWorkspace = () => {
  const blocks = useProgramStore((state) => state.blocks);

  const updateBlock = useProgramStore((state) => state.updateBlock);

  const moveBlock = useProgramStore((state) => state.moveBlock);

  const removeBlock = useProgramStore((state) => state.removeBlock);

  const clearProgram = useProgramStore((state) => state.clearProgram);

  const shapes = useShapeStore((state) => state.shapes);

  const activeBlockId = useExecutionStore((state) => state.activeBlockId);

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

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) {
      return;
    }

    const droppedContainerId = parseContainerId(overId);

    if (droppedContainerId) {
      moveBlock(activeId, droppedContainerId, null);
      clearExecution();
      return;
    }

    const targetParentId =
      getBlockParentId(blocks, overId) ?? ROOT_CONTAINER_ID;

    moveBlock(activeId, targetParentId, overId);
    clearExecution();
  };

  const handleRemoveBlock = (id: string) => {
    removeBlock(id);
    clearExecution();
  };

  const handleClearProgram = () => {
    clearProgram();
    clearExecution();
  };

  const totalBlockCount = countProgramBlocks(blocks);

  return (
    <section className="panel workspace-panel">
      <div className="panel__header">
        <h2 className="panel__title">프로그램</h2>

        <div className="workspace-panel__actions">
          <span className="panel__count">{totalBlockCount}</span>

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
          <ProgramBlockList
            blocks={blocks}
            parentId={ROOT_CONTAINER_ID}
            depth={0}
            shapes={shapes}
            activeBlockId={activeBlockId}
            updateBlock={updateBlock}
            removeBlock={handleRemoveBlock}
          />
        </DndContext>
      )}
    </section>
  );
};
