import type { ProgramBlock } from "../types/block";
import type { Shape } from "../types/shape";

export interface ExecutionResult {
  shapes: Shape[];
  logs: string[];
}

export const executeProgram = (
  blocks: ProgramBlock[],
  initialShapes: Shape[],
): ExecutionResult => {
  return {
    shapes: initialShapes,
    logs: [`${blocks.length}개의 블록을 실행할 준비가 되었습니다.`],
  };
};
