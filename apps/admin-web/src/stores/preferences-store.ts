import { create } from "zustand";
type PreferencesState = { commandOpen: boolean; setCommandOpen: (open: boolean) => void };
export const usePreferencesStore = create<PreferencesState>((set) => ({ commandOpen: false, setCommandOpen: (commandOpen) => set({ commandOpen }) }));
