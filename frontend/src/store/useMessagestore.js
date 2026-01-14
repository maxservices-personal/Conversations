import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMessageStore = create((set, get) => ({
  messages: [],
  isGettingMessages: false,
  replyingData: {},
  uploadFilesSelected: [],
  setReplyingData: (data) => set({ replyingData: data }),

  setMessages: (value) => set({ messages: value }),

  getMessages: async (receiver_id) => {
    try {
      set({ isGettingMessages: true });
      const response = await axiosInstance.post("/auth/get/messages", {
        receiver_id: receiver_id,
      });
      console.log(response.data);
      set({ messages: response.data.messages });
      set({ isGettingMessages: false });
    } catch (error) {
      console.log(error);
      toast.error("Problem in getMessages");
      set({ isGettingMessages: false });
    }
  },

  sendMessage: async (sender_id, receiver_id, text, replyyData, timestamp) => {
    try {
      const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      set({
        messages: [
          ...get().messages,
          {
            sender_id: sender_id,
            receiver_id: receiver_id,
            text: text,
            reply: replyyData,
            id: id,
            sending_time: timestamp,
          },
        ],
      });
      const response = await axiosInstance.post("/send/message", {
        sender_id: sender_id,
        receiver_id: receiver_id,
        text: text,
        replying_data: replyyData,
        revised_id: id,
        sending_time: timestamp,
      });
      console.log(response);
    } catch (error) {
      toast.error("error in sendMessage: " + error);
      console.log(error);
    }
  },
  addMessage: (message) => {
    set({ messages: [...get().messages, message] });
  },

  new_messages: [],
  setNewMessages: (data) => set({ new_messages: data }),
  addNewMessage: (message) => {
    const messages = get().new_messages;

    const index = messages.findIndex((msg) => msg.user_id === message.sender_id);

    if (index !== -1) {
      const updated = [...messages];
      updated[index].number_of_messages += 1;
      updated[index].message = message.text;
      updated[index].timestamp = message.timestamp;
      set({ new_messages: updated });
    } else {
      const id = message.sender_id;
      set({ new_messages: [...messages, { id, number_of_messages: 1, message: message.text, timestamp: message.timestamp }] });
    }
  },
  markAsSeen: (user_id) => {
    const messages = get().new_messages;

    const updated = messages.filter((msg) => msg.user_id !== user_id);

    set({ new_messages: updated });
  },
  getNewMessageCount: (user_id) => {
    const messages = get().new_messages;

    const userMsg = messages.find((msg) => msg.user_id === user_id);

    return userMsg ? userMsg.number_of_messages : 0;
  },
  getNewMessage: (user_id) => {
    const messages = get().new_messages;

    const userMsg = messages.find((msg) => msg.user_id === user_id)
    console.log(userMsg)
    return userMsg ? userMsg.message : "";
  },
  setUploadFilesSelected: (value)=>set({uploadFilesSelected: value}),
  uploadFile: async () => {
    try {
        console.log(get().uploadFilesSelected)
        const formData = new FormData();
        get().uploadFilesSelected.forEach((fileObj, index) => {
            formData.append('files', fileObj.file);
            formData.append("fileTypes[]", fileObj.type);
        });
        const response = await axiosInstance.post("/auth/upload/files", formData , {headers: {
      'Content-Type': 'multipart/form-data'
    }});
        console.log(response.data.files);
        set({uploadFilesSelected: response.data.files})
    } catch (error) {
        console.log(error);
        toast.error("Error in upload files")
    }
        
  },
  removeMessage: (id) =>
  set((state) => ({
    messages: state.messages.filter((m) => m.id !== id),
  })),

  updateMessage: (id, newData) =>
  set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === id ? { ...msg, ...newData } : msg
    ),
  })),


}));
