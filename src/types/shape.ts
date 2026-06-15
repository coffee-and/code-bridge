export type ShapeType = "rectangle" | "circle" | "triangle";

export interface Shape {
  id: string;
  name: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  visible: boolean;
}

export interface CreateShapeInput {
  name: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}
