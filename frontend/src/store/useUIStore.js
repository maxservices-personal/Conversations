import { create } from "zustand";


export const useUIStore = create((set, get) => ({
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    isSettingsOpen: false,
    toggleIsSettingsOpen: () => {set((state) => ({ isSettingsOpen: !state.isSettingsOpen }))},
    isOnStandBy: false,
    toggleIsOnStandBy:  () => {set((state) => ({ isOnStandBy: !state.isOnStandBy }))},

    theme: "light",

    isAddMoment: false,
    setIsAddMoment: (valv)=>set({ isAddMoment: valv })
    
}));