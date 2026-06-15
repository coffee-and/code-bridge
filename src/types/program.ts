import type { ProgramBlock } from "./block";
import type { Shape } from "./shape";

export interface Program {
  id: string;
  name: string;
  shapes: Shape[];
  blocks: ProgramBlock[];
  createdAt: string;
  updatedAt: string;
}
