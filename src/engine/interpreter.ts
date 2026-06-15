import { useShapeStore } from "../stores/shapeStore";
import type { ActionBlock, ProgramBlock } from "../types/block";

const isActionBlock = (block: ProgramBlock): block is ActionBlock => {
  return block.type !== "repeat";
};

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

      shapeStore.updateShape(targetShape.id, {
        x: nextPosition.x,
        y: nextPosition.y,
      });

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

export const executeProgramBlock = (
  block: ProgramBlock,
  previousBlock?: ProgramBlock,
) => {
  if (isActionBlock(block)) {
    executeActionBlock(block);
    return;
  }

  if (!previousBlock || !isActionBlock(previousBlock)) {
    return;
  }

  const repeatCount = Math.max(1, Math.floor(block.count));

  /*
   * 바로 위 명령은 프로그램 순서에서 이미 한 번 실행됐어.
   * 따라서 "3번 반복"을 총 3회 실행으로 해석해서
   * 여기서는 2번을 추가 실행한다.
   */
  const additionalExecutions = repeatCount - 1;

  for (let index = 0; index < additionalExecutions; index += 1) {
    executeActionBlock(previousBlock);
  }
};

export const executeProgram = (blocks: ProgramBlock[]) => {
  for (let index = 0; index < blocks.length; index += 1) {
    executeProgramBlock(blocks[index], blocks[index - 1]);
  }
};
