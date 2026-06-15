export type BlockType = "move" | "rotate" | "changeColor" | "repeat";

export type MoveDirection = "up" | "down" | "left" | "right";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface MoveBlock extends BaseBlock {
  type: "move";
  params: {
    shapeId: string;
    direction: MoveDirection;
    distance: number;
  };
}

export interface RotateBlock extends BaseBlock {
  type: "rotate";
  params: {
    shapeId: string;
    angle: number;
  };
}

export interface ChangeColorBlock extends BaseBlock {
  type: "changeColor";
  params: {
    shapeId: string;
    color: string;
  };
}

export interface RepeatBlock extends BaseBlock {
  type: "repeat";
  params: {
    count: number;
  };
  children: ProgramBlock[];
}

export type ProgramBlock =
  | MoveBlock
  | RotateBlock
  | ChangeColorBlock
  | RepeatBlock;
