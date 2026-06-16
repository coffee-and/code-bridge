import { useEffect, useRef, useState } from "react";
import { Ellipse, Layer, Line, Rect, Stage, Transformer } from "react-konva";
import type Konva from "konva";

import { useShapeStore } from "../../stores/shapeStore";

const MIN_CANVAS_HEIGHT = 420;
const MIN_SHAPE_SIZE = 20;

export const CanvasPreview = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const shapeRefs = useRef<Record<string, Konva.Node | null>>({});

  const [canvasSize, setCanvasSize] = useState({
    width: 600,
    height: MIN_CANVAS_HEIGHT,
  });

  const shapes = useShapeStore((state) => state.shapes);
  const selectedShapeId = useShapeStore((state) => state.selectedShapeId);
  const selectShape = useShapeStore((state) => state.selectShape);
  const updateShape = useShapeStore((state) => state.updateShape);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateCanvasSize = () => {
      setCanvasSize({
        width: Math.max(container.clientWidth, 280),
        height: Math.max(container.clientHeight, MIN_CANVAS_HEIGHT),
      });
    };

    updateCanvasSize();

    const observer = new ResizeObserver(updateCanvasSize);

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;

    if (!transformer) {
      return;
    }

    if (!selectedShapeId) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }

    const selectedNode = shapeRefs.current[selectedShapeId];

    if (!selectedNode) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }

    transformer.nodes([selectedNode]);
    transformer.getLayer()?.batchDraw();
  }, [selectedShapeId, shapes]);

  const handleStagePointerDown = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    const stage = event.target.getStage();
    const clickedOnStage = event.target === stage;

    if (clickedOnStage) {
      selectShape(null);
    }
  };

  return (
    <section className="panel preview-panel">
      <div className="panel__header">
        <h2 className="panel__title">실행 화면</h2>

        <span className="panel__count">{shapes.length}</span>
      </div>

      <div className="preview-panel__canvas" ref={containerRef}>
        {shapes.length === 0 && (
          <div className="preview-panel__empty">
            <p>
              도형을 만들면 이곳에서 프로그램의 실행 결과를 확인할 수 있어요.
            </p>
          </div>
        )}

        <Stage
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleStagePointerDown}
          onTouchStart={handleStagePointerDown}
        >
          <Layer>
            {shapes.map((shape) => {
              /*
               * Store에서는 모든 도형의 x, y를
               * 왼쪽 위 좌표로 유지한다.
               *
               * Konva에서는 도형 중심을 x, y로 사용해
               * 회전 중심을 모든 도형에서 동일하게 맞춘다.
               */
              const centerX = shape.x + shape.width / 2;
              const centerY = shape.y + shape.height / 2;

              const handleDragEnd = (
                event: Konva.KonvaEventObject<DragEvent>,
              ) => {
                updateShape(shape.id, {
                  x: Math.round(event.target.x() - shape.width / 2),
                  y: Math.round(event.target.y() - shape.height / 2),
                });
              };

              const handleTransformEnd = () => {
                const node = shapeRefs.current[shape.id];

                if (!node) {
                  return;
                }

                const scaleX = Math.abs(node.scaleX());
                const scaleY = Math.abs(node.scaleY());

                const nextWidth = Math.max(
                  MIN_SHAPE_SIZE,
                  Math.round(shape.width * scaleX),
                );

                const nextHeight = Math.max(
                  MIN_SHAPE_SIZE,
                  Math.round(shape.height * scaleY),
                );

                /*
                 * Transformer가 적용한 scale을
                 * 실제 width, height 값으로 옮기고
                 * node의 scale은 다시 1로 초기화한다.
                 */
                node.scaleX(1);
                node.scaleY(1);

                updateShape(shape.id, {
                  x: Math.round(node.x() - nextWidth / 2),
                  y: Math.round(node.y() - nextHeight / 2),
                  width: nextWidth,
                  height: nextHeight,
                  rotation: Math.round(node.rotation()),
                });
              };

              const commonProps = {
                key: shape.id,
                id: shape.id,

                x: centerX,
                y: centerY,

                rotation: shape.rotation,
                fill: shape.color,
                visible: shape.visible,
                draggable: true,

                stroke:
                  selectedShapeId === shape.id ? "#006fc4" : "transparent",

                strokeWidth: selectedShapeId === shape.id ? 2 : 0,

                ref: (node: Konva.Node | null) => {
                  shapeRefs.current[shape.id] = node;
                },

                onClick: () => selectShape(shape.id),

                onTap: () => selectShape(shape.id),

                onDragEnd: handleDragEnd,
                onTransformEnd: handleTransformEnd,
              };

              if (shape.type === "circle") {
                return (
                  <Ellipse
                    {...commonProps}
                    radiusX={shape.width / 2}
                    radiusY={shape.height / 2}
                  />
                );
              }

              if (shape.type === "triangle") {
                return (
                  <Line
                    {...commonProps}
                    points={[
                      -shape.width / 2,
                      shape.height / 2,

                      0,
                      -shape.height / 2,

                      shape.width / 2,
                      shape.height / 2,
                    ]}
                    closed
                    lineJoin="round"
                  />
                );
              }

              return (
                <Rect
                  {...commonProps}
                  width={shape.width}
                  height={shape.height}
                  offsetX={shape.width / 2}
                  offsetY={shape.height / 2}
                  cornerRadius={8}
                />
              );
            })}

            <Transformer
              ref={transformerRef}
              rotateEnabled
              flipEnabled={false}
              keepRatio={false}
              anchorSize={8}
              borderStroke="#0091ff"
              anchorStroke="#0091ff"
              anchorFill="#ffffff"
              boundBoxFunc={(oldBox, newBox) => {
                if (
                  Math.abs(newBox.width) < MIN_SHAPE_SIZE ||
                  Math.abs(newBox.height) < MIN_SHAPE_SIZE
                ) {
                  return oldBox;
                }

                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </section>
  );
};
