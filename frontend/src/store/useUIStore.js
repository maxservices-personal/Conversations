import { create } from "zustand";
import { axiosInstance } from "../lib/axios";


export const useUIStore = create((set, get) => ({
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    isSidebarMinimized: true,
    toggleIsSidebarMinimized: (valv) => set({ isSidebarMinimized: valv }),
    isExploreTab: false,
    setIsExploreTab: (valv)=>set({ isExploreTab: valv }),
    isSettingsOpen: false,
    toggleIsSettingsOpen: () => {set((state) => ({ isSettingsOpen: !state.isSettingsOpen }))},
    isOnStandBy: false,
    toggleIsOnStandBy:  () => {set((state) => ({ isOnStandBy: !state.isOnStandBy }))},

    theme: "light",

    isAddMoment: false,
    setIsAddMoment: (valv)=>set({ isAddMoment: valv }),
    selectedUserForHandlePage: null,
    setSelectedUserForHandlePage: (user)=>set({ selectedUserForHandlePage: user }),
    userDetails: null,
    isGettingUserDetails: false,
    getUserDetails: async (userhandle)=>{
        try {
            set({isGettingUserDetails: true})
            const response = await axiosInstance.post("/get/user_details", { "handle":userhandle })
            console.log(response.data.user)
            set({userDetails: response.data.user})
            set({isGettingUserDetails: false})
        } catch (error) {
            set({isGettingUserDetails: false})
            console.log("ERROR", error)
        }
    },
    setUserDetails: (data)=>set({ userDetails: data }),
}));