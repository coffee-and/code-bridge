import type { ProgramBlock } from "../types/block";

export const generateJavaScript = (blocks: ProgramBlock[]): string => {
  if (blocks.length === 0) {
    return "// 블록을 추가하면 JavaScript 코드가 표시됨";
  }

  return "// 코드 생성 기능은 다음 단계에서 구현";
};
