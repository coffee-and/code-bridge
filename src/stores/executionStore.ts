import { create } from "zustand";

import type { Shape } from "../types/shape";

interface ExecutionState {
  currentStep: number;
  activeBlockIndex: number | null;
  initialShapes: Shape[] | null;

  setCurrentStep: (step: number) => void;
  setActiveBlockIndex: (index: number | null) => void;
  captureInitialShapes: (shapes: Shape[]) => void;
  clearExecution: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  currentStep: 0,
  activeBlockIndex: null,
  initialShapes: null,

  setCurrentStep: (step) => {
    set({ currentStep: step });
  },

  setActiveBlockIndex: (index) => {
    set({ activeBlockIndex: index });
  },

  captureInitialShapes: (shapes) => {
    set((state) => {
      if (state.initialShapes) {
        return state;
      }

      return {
        initialShapes: shapes.map((shape) => ({ ...shape })),
      };
    });
  },

  clearExecution: () => {
    set({
      currentStep: 0,
      activeBlockIndex: null,
      initialShapes: null,
    });
  },
}));
