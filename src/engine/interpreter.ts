import { useShapeStore } from "../stores/shapeStore";
import type { ActionBlock, ProgramBlock } from "../types/block";

export interface ExecutionStep {
  blockId: string;
  block: ActionBlock;
}

export const executeActionBlock = (block: ActionBlock) => {
  const shapeStore = useShapeStore.getState();

  const targetShape = shapeStore.shapes.find(
    (shape) => shape.id === block.targetShapeId,
  );

  if (!targetShape) {
    return;
  }

  switch (block.type) {
    case "move": {
      const nextPosition = {
        x: targetShape.x,
        y: targetShape.y,
      };

      switch (block.direction) {
        case "left":
          nextPosition.x -= block.distance;
          break;

        case "right":
          nextPosition.x += block.distance;
          break;

        case "up":
          nextPosition.y -= block.distance;
          break;

        case "down":
          nextPosition.y += block.distance;
          break;
      }

      shapeStore.updateShape(targetShape.id, nextPosition);
      break;
    }

    case "rotate":
      shapeStore.updateShape(targetShape.id, {
        rotation: targetShape.rotation + block.angle,
      });
      break;

    case "changeColor":
      shapeStore.updateShape(targetShape.id, {
        color: block.color,
      });
      break;
  }
};

export const createExecutionPlan = (
  blocks: ProgramBlock[],
): ExecutionStep[] => {
  const steps: ExecutionStep[] = [];

  const visitBlocks = (currentBlocks: ProgramBlock[]) => {
    for (const block of currentBlocks) {
      if (block.type !== "repeat") {
        steps.push({
          blockId: block.id,
          block,
        });

        continue;
      }

      const repeatCount = Math.min(100, Math.max(1, Math.floor(block.count)));

      for (let index = 0; index < repeatCount; index += 1) {
        visitBlocks(block.children);
      }
    }
  };

  visitBlocks(blocks);

  return steps;
};

export const executeProgramStep = (step: ExecutionStep) => {
  executeActionBlock(step.block);
};

export const executeProgram = (blocks: ProgramBlock[]) => {
  const executionPlan = createExecutionPlan(blocks);

  for (const step of executionPlan) {
    executeProgramStep(step);
  }

  return executionPlan;
};
