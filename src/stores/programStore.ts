import { create } from "zustand";

import type {
  ChangeColorBlock,
  MoveBlock,
  ProgramBlock,
  RepeatBlock,
  RotateBlock,
} from "../types/block";
import { createId } from "../utils/createId";

interface ProgramState {
  blocks: ProgramBlock[];

  addMoveBlock: (targetShapeId: string) => void;
  addRotateBlock: (targetShapeId: string) => void;
  addChangeColorBlock: (targetShapeId: string) => void;
  addRepeatBlock: () => void;

  updateBlock: (id: string, changes: Partial<ProgramBlock>) => void;

  removeBlock: (id: string) => void;
  clearProgram: () => void;
}

export const useProgramStore = create<ProgramState>((set) => ({
  blocks: [],

  addMoveBlock: (targetShapeId) =>
    set((state) => {
      const block: MoveBlock = {
        id: createId("block"),
        type: "move",
        targetShapeId,
        direction: "right",
        distance: 50,
      };

      return {
        blocks: [...state.blocks, block],
      };
    }),

  addRotateBlock: (targetShapeId) =>
    set((state) => {
      const block: RotateBlock = {
        id: createId("block"),
        type: "rotate",
        targetShapeId,
        angle: 45,
      };

      return {
        blocks: [...state.blocks, block],
      };
    }),

  addChangeColorBlock: (targetShapeId) =>
    set((state) => {
      const block: ChangeColorBlock = {
        id: createId("block"),
        type: "changeColor",
        targetShapeId,
        color: "#0091ff",
      };

      return {
        blocks: [...state.blocks, block],
      };
    }),

  addRepeatBlock: () =>
    set((state) => {
      const block: RepeatBlock = {
        id: createId("block"),
        type: "repeat",
        count: 3,
      };

      return {
        blocks: [...state.blocks, block],
      };
    }),

  updateBlock: (id, changes) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? ({ ...block, ...changes } as ProgramBlock) : block,
      ),
    })),

  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
    })),

  clearProgram: () => {
    set({ blocks: [] });
  },
}));
