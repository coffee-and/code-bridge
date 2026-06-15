import { create } from "zustand";

export type ExecutionStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "error";

interface ExecutionState {
  status: ExecutionStatus;
  activeBlockId: string | null;
  speed: number;
  errorMessage: string | null;

  setStatus: (status: ExecutionStatus) => void;
  setActiveBlockId: (id: string | null) => void;
  setSpeed: (speed: number) => void;
  setError: (message: string | null) => void;
  resetExecution: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  status: "idle",
  activeBlockId: null,
  speed: 1,
  errorMessage: null,

  setStatus: (status) => {
    set({ status });
  },

  setActiveBlockId: (id) => {
    set({ activeBlockId: id });
  },

  setSpeed: (speed) => {
    set({ speed });
  },

  setError: (message) => {
    set({
      errorMessage: message,
      status: message ? "error" : "idle",
    });
  },

  resetExecution: () => {
    set({
      status: "idle",
      activeBlockId: null,
      errorMessage: null,
    });
  },
}));
