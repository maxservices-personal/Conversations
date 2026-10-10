import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://conversations-bzqu.onrender.com/api",
    withCredentials: true
})