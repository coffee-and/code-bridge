import { useState } from "react";

import { useShapeStore } from "../../stores/shapeStore";
import { ShapeCreateModal } from "./ShapeCreateModal";

export const ShapePanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const shapes = useShapeStore((state) => state.shapes);
  const selectedShapeId = useShapeStore((state) => state.selectedShapeId);
  const selectShape = useShapeStore((state) => state.selectShape);
  const removeShape = useShapeStore((state) => state.removeShape);

  return (
    <>
      <section className="panel">
        <div className="panel__header">
          <h2 className="panel__title">도형</h2>

          <span className="panel__count">{shapes.length}</span>
        </div>

        {shapes.length === 0 ? (
          <div className="shape-panel__empty">
            <p className="panel__description">
              직접 만든 도형에 이동, 회전과 반복 명령을 연결할 수 있어요.
            </p>

            <button
              className="button button--full button--dashed"
              type="button"
              onClick={() => setIsModalOpen(true)}
            >
              + 도형 만들기
            </button>
          </div>
        ) : (
          <div className="shape-panel__content">
            <ul className="shape-list">
              {shapes.map((shape) => {
                const isSelected = shape.id === selectedShapeId;

                return (
                  <li key={shape.id}>
                    <button
                      className={`shape-list-item ${
                        isSelected ? "shape-list-item--selected" : ""
                      }`}
                      type="button"
                      onClick={() => selectShape(shape.id)}
                    >
                      <span
                        className={`shape-list-item__preview ${
                          shape.type === "circle"
                            ? "shape-list-item__preview--circle"
                            : shape.type === "triangle"
                              ? "shape-list-item__preview--triangle"
                              : ""
                        }`}
                        style={{
                          backgroundColor:
                            shape.type === "triangle"
                              ? "transparent"
                              : shape.color,
                          color: shape.color,
                        }}
                      />

                      <span className="shape-list-item__info">
                        <strong>{shape.name}</strong>

                        <small>
                          {shape.type === "rectangle"
                            ? "사각형"
                            : shape.type === "circle"
                              ? "원"
                              : "삼각형"}
                        </small>
                      </span>

                      <span
                        className="shape-list-item__remove"
                        role="button"
                        tabIndex={0}
                        aria-label={`${shape.name} 도형 삭제`}
                        onClick={(event) => {
                          event.stopPropagation();
                          removeShape(shape.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            removeShape(shape.id);
                          }
                        }}
                      >
                        ×
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              className="button button--full button--dashed"
              type="button"
              onClick={() => setIsModalOpen(true)}
            >
              + 도형 추가
            </button>
          </div>
        )}
      </section>

      <ShapeCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
