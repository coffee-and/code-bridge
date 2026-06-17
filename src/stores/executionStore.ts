import { create } from "zustand";

import type { Shape } from "../types/shape";

interface ExecutionState {
  currentStep: number;
  activeBlockId: string | null;
  initialShapes: Shape[] | null;

  setCurrentStep: (step: number) => void;
  setActiveBlockId: (id: string | null) => void;
  captureInitialShapes: (shapes: Shape[]) => void;
  clearExecution: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  currentStep: 0,
  activeBlockId: null,
  initialShapes: null,

  setCurrentStep: (step) => {
    set({
      currentStep: step,
    });
  },

  setActiveBlockId: (id) => {
    set({
      activeBlockId: id,
    });
  },

  captureInitialShapes: (shapes) => {
    set((state) => {
      if (state.initialShapes) {
        return state;
      }

      return {
        initialShapes: shapes.map((shape) => ({
          ...shape,
        })),
      };
    });
  },

  clearExecution: () => {
    set({
      currentStep: 0,
      activeBlockId: null,
      initialShapes: null,
    });
  },
}));
