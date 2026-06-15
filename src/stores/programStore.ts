import { create } from "zustand";
import type { ProgramBlock } from "../types/block";

interface ProgramState {
  blocks: ProgramBlock[];
  selectedBlockId: string | null;

  setBlocks: (blocks: ProgramBlock[]) => void;
  addBlock: (block: ProgramBlock) => void;
  removeBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  resetProgram: () => void;
}

export const useProgramStore = create<ProgramState>((set) => ({
  blocks: [],
  selectedBlockId: null,

  setBlocks: (blocks) => {
    set({ blocks });
  },

  addBlock: (block) =>
    set((state) => ({
      blocks: [...state.blocks, block],
    })),

  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
      selectedBlockId:
        state.selectedBlockId === id ? null : state.selectedBlockId,
    })),

  selectBlock: (id) => {
    set({ selectedBlockId: id });
  },

  resetProgram: () => {
    set({
      blocks: [],
      selectedBlockId: null,
    });
  },
}));
