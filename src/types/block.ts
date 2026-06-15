export type MoveDirection = "left" | "right" | "up" | "down";

export interface MoveBlock {
  id: string;
  type: "move";
  targetShapeId: string;
  direction: MoveDirection;
  distance: number;
}

export interface RotateBlock {
  id: string;
  type: "rotate";
  targetShapeId: string;
  angle: number;
}

export interface ChangeColorBlock {
  id: string;
  type: "changeColor";
  targetShapeId: string;
  color: string;
}

export interface RepeatBlock {
  id: string;
  type: "repeat";
  count: number;
}

export type ActionBlock = MoveBlock | RotateBlock | ChangeColorBlock;

export type ProgramBlock = ActionBlock | RepeatBlock;
