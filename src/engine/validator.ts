import type { ProgramBlock } from "../types/block";
import type { Shape } from "../types/shape";

export interface ValidationResult {
  valid: boolean;
  messages: string[];
}

export const validateProgram = (
  blocks: ProgramBlock[],
  shapes: Shape[],
): ValidationResult => {
  const messages: string[] = [];

  if (shapes.length === 0) {
    messages.push("먼저 도형을 만들어 주세요.");
  }

  if (blocks.length === 0) {
    messages.push("실행할 블록을 추가해 주세요.");
  }

  return {
    valid: messages.length === 0,
    messages,
  };
};
