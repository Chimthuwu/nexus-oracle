import { create } from 'zustand';

interface OracleState {
  isThinking: boolean;
  setThinking: (thinking: boolean) => void;
  responseText: string;
  setResponseText: (text: string) => void;
}

export const useOracleStore = create<OracleState>((set) => ({
  isThinking: false,
  setThinking: (thinking) => set({ isThinking: thinking }),
  responseText: '',
  setResponseText: (text) => set({ responseText: text }),
}));
