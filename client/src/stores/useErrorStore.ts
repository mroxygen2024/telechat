import { create } from "zustand";

export type GlobalError = {
  id: string;
  message: string;
  timestamp: number;
};

interface ErrorStore {
  errors: GlobalError[];
  addError: (message: string) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export const useErrorStore = create<ErrorStore>((set) => ({
  errors: [],
  addError: (message) =>
    set((state) => ({
      errors: [
        ...state.errors,
        { id: crypto.randomUUID(), message, timestamp: Date.now() },
      ],
    })),
  removeError: (id) =>
    set((state) => ({
      errors: state.errors.filter((error) => error.id !== id),
    })),
  clearErrors: () => set({ errors: [] }),
}));
