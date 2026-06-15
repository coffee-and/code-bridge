import { useEffect, useRef, useState } from "react";
import {
  Circle,
  Layer,
  Rect,
  RegularPolygon,
  Stage,
  Transformer,
} from "react-konva";
import type Konva from "konva";

import { useShapeStore } from "../../stores/shapeStore";

const MIN_CANVAS_HEIGHT = 420;

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

    if (selectedNode) {
      transformer.nodes([selectedNode]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedShapeId, shapes]);

  const handleStageMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnStage = event.target === event.target.getStage();

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
          onMouseDown={handleStageMouseDown}
          onTouchStart={(event) => {
            const clickedOnStage = event.target === event.target.getStage();

            if (clickedOnStage) {
              selectShape(null);
            }
          }}
        >
          <Layer>
            {shapes.map((shape) => {
              const commonProps = {
                key: shape.id,
                id: shape.id,
                x: shape.x,
                y: shape.y,
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

                onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => {
                  updateShape(shape.id, {
                    x: Math.round(event.target.x()),
                    y: Math.round(event.target.y()),
                  });
                },

                onTransformEnd: () => {
                  const node = shapeRefs.current[shape.id];

                  if (!node) {
                    return;
                  }

                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  node.scaleX(1);
                  node.scaleY(1);

                  updateShape(shape.id, {
                    x: Math.round(node.x()),
                    y: Math.round(node.y()),
                    rotation: Math.round(node.rotation()),
                    width: Math.max(20, Math.round(shape.width * scaleX)),
                    height: Math.max(20, Math.round(shape.height * scaleY)),
                  });
                },
              };

              if (shape.type === "circle") {
                return (
                  <Circle
                    {...commonProps}
                    radius={Math.min(shape.width, shape.height) / 2}
                  />
                );
              }

              if (shape.type === "triangle") {
                return (
                  <RegularPolygon
                    {...commonProps}
                    sides={3}
                    radius={Math.min(shape.width, shape.height) / 2}
                  />
                );
              }

              return (
                <Rect
                  {...commonProps}
                  width={shape.width}
                  height={shape.height}
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
              boundBoxFunc={(_, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) {
                  return _;
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
