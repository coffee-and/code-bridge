import { useExecutionStore } from "../../stores/executionStore";
import { useProgramStore } from "../../stores/programStore";
import { useShapeStore } from "../../stores/shapeStore";
import type { MoveDirection } from "../../types/block";

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

export const ProgramWorkspace = () => {
  const blocks = useProgramStore((state) => state.blocks);
  const updateBlock = useProgramStore((state) => state.updateBlock);
  const removeBlock = useProgramStore((state) => state.removeBlock);
  const clearProgram = useProgramStore((state) => state.clearProgram);

  const shapes = useShapeStore((state) => state.shapes);

  const activeBlockIndex = useExecutionStore((state) => state.activeBlockIndex);

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
              onClick={clearProgram}
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
        <ol className="program-block-list">
          {blocks.map((block, index) => {
            const isActive = activeBlockIndex === index;

            const blockTitle =
              block.type === "move"
                ? "이동"
                : block.type === "rotate"
                  ? "회전"
                  : block.type === "changeColor"
                    ? "색상 변경"
                    : "반복";

            return (
              <li
                key={block.id}
                className={`program-block program-block--${block.type} ${
                  isActive ? "program-block--active" : ""
                }`}
              >
                <div className="program-block__number">{index + 1}</div>

                <div className="program-block__content">
                  <div className="program-block__header">
                    <strong>{blockTitle}</strong>

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
                      <select
                        className="block-control"
                        value={block.targetShapeId}
                        onChange={(event) =>
                          updateBlock(block.id, {
                            targetShapeId: event.target.value,
                          })
                        }
                      >
                        {shapes.map((shape) => (
                          <option key={shape.id} value={shape.id}>
                            {shape.name}
                          </option>
                        ))}
                      </select>
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
          })}
        </ol>
      )}
    </section>
  );
};
