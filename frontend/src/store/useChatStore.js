import { create } from "zustand";


export const useChatStore = create((set, get) => ({
    selectedFriend: null,
    setSelectedFriend: (friend)=>{
        set({ selectedFriend: friend })
    }  
}));