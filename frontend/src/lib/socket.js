import { io } from "socket.io-client";


export const socket = io("https://conversations-bzqu.onrender.com", { withCredentials: true });