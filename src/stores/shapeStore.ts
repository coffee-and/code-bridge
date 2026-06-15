import { create } from "zustand";

import type { CreateShapeInput, Shape } from "../types/shape";
import { createId } from "../utils/createId";

interface ShapeState {
  shapes: Shape[];
  selectedShapeId: string | null;

  addShape: (input: CreateShapeInput) => void;
  updateShape: (id: string, changes: Partial<Shape>) => void;
  removeShape: (id: string) => void;
  selectShape: (id: string | null) => void;
  resetShapes: () => void;
}

export const useShapeStore = create<ShapeState>((set) => ({
  shapes: [],
  selectedShapeId: null,

  addShape: (input) =>
    set((state) => {
      const newShape: Shape = {
        id: createId("shape"),
        name: input.name,
        type: input.type,
        x: input.x,
        y: input.y,
        width: input.width,
        height: input.height,
        rotation: 0,
        color: input.color,
        visible: true,
      };

      return {
        shapes: [...state.shapes, newShape],
        selectedShapeId: newShape.id,
      };
    }),

  updateShape: (id, changes) =>
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...changes } : shape,
      ),
    })),

  removeShape: (id) =>
    set((state) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
      selectedShapeId:
        state.selectedShapeId === id ? null : state.selectedShapeId,
    })),

  selectShape: (id) => {
    set({ selectedShapeId: id });
  },

  resetShapes: () => {
    set({
      shapes: [],
      selectedShapeId: null,
    });
  },
}));
