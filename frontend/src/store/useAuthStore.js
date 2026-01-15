import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIng: false,
  isCheckingAuth: true,
  activeUsers: [],
  users: [],
  isGettingUsers: false,
  friend_requests: [],

  setUsers: (value)=> {
    set({ users: value })
  },

  getFriendRequests: async () => {
    try {
      set({ isGettingUsers: true });
      const response = await axiosInstance.post("/get/friend_requests");
      set({ friend_requests: response.data.data });
      console.log(response.data.data);
      set({ isGettingUsers: false });
    } catch (error) {
      toast.error("Friend requests cannot be found.");
      set({ isGettingUsers: false });
    }
  },

  getUsers: async () => {
    try {
      set({isGettingUsers: true})
      const response = await axiosInstance.get("/auth/get/users")
      set({ users: response.data })
      set({isGettingUsers: false})
    } catch (error) {
      toast.error("Users cannot be found.")
      set({isGettingUsers: false})

    }
  },
  friends: [],
  isGettingFriends: false,
  getFriends: async () => {
    try {
      set({ isGettingFriends: true });
      const response = await axiosInstance.post("/get/friends");
      console.log(response);
      set({ friends: response.data.friend_list });
      set({ isGettingFriends: false });
    } catch (error) {
      set({ isGettingFriends: false });
      console.log(error);
      toast.error("error while getting friends");
    }
  },

  addFriend: async (friends_id)=>{
    try {
      const response = await axiosInstance.post("/add/friends", {"friend_id":friends_id},)
      console.log(response)
      set({friends: response.data.friend_list})
    } catch (error) {
      toast.error("Error in addFriend");
    }
  },

  setActiveUsers: (users) => set({ activeUsers: users }),

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
    } catch (error) {
      set({ authUser: null });
      if (error.message == "Network Error") {
        toast.error(error.message + ". Please check your connection.")
      }
      console.log("Error in checkAuth: " + error.message);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  googleLoginSuccess: async (credentialResponse) => {
    const token = credentialResponse.credential;
    console.log("token", token, credentialResponse);

    const res = await axiosInstance.post("/auth/google", {
      token,
    });
    console.log(res.data);
    set({ authUser: res.data });
    toast.success("Login successfully");
    window.location.reload();
  },

  googleLoginError: (error) => {
    console.log(error);
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
        const res = await axiosInstance.post("/auth/signup", data);
        set({ authUser: res.data });
        toast.success("Account created successfully");
        window.location.reload();
    } catch (error) {
        toast.error(error.response.data.message);
    } finally {
        set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIng: true })
    try {
        const res = await axiosInstance.post("/auth/login", data);
        set({ authUser: res.data });
        toast.success("Logged in successfully");
    } catch (error) {
        toast.error(error.response.data.error);
    } finally {
        set({ isLoggingIn: false });
        window.location.reload();
    }
  },
  logout: async () => {
    if (window.confirm("Are you sure you want to logout?")) { 
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    } else {
        toast.error("Logout cancelled");
    }
},

    updateProfile: async (data) => {
        try {
            const response = await axiosInstance.post('/auth/setup/profile', data);
            console(response);
            toast.success("Profile updated successfully");
            window.location.reload();

        } catch (error) {
            toast.error(error.response.data.message);
        }
    }
}));
