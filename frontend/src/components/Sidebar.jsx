import { Ellipsis, LogOut, Plus, RefreshCw, Settings, User, Users } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useMessageStore } from "../store/useMessagestore";
import { socket } from "../lib/socket";
import { useUIStore } from "../store/useUIStore";
import SingleTpyeButton from "../components/UIComponents/SingleTypeButton"
import Profile from "./UIComponents/Profile";
import ChatsSideBarSection from "./SidebarComponents/ChatsSideBarSection";
import ChatsSideBarExplore from "./SidebarComponents/ChatsSideBarExplore";

const Sidebar = () => {
    const [tabActive, setTabActive] = useState({
        chats: true,
        explore: false
    });

    const { getFriends, authUser, setActiveUsers, setUsers } = useAuthStore();


    useEffect(()=>{
        getFriends()
    }, [getFriends])

    const sidebarRef = useRef(null);

    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            if (sidebarRef.current.scrollTop > 1) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        const sidebarCurrent = sidebarRef.current;
        if (sidebarCurrent) {
            sidebarCurrent.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (sidebarCurrent) {
                sidebarCurrent.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    
    useEffect(() => {
        socket.emit("join", { _id: authUser?._id });
        }, []);

    useEffect(() => {
    const handleActiveUsers = ({ active_users }) => {
        console.log("Active users:", active_users);
        setActiveUsers(active_users);
    };

    const handleLastSeenUpdate = ({ user_id, last_seen }) => {
        console.log("Last seen update:", user_id, last_seen);

        setUsers(prevUsers =>
            prevUsers.map(user =>
                String(user._id) === user_id
                    ? { ...user, last_seen }
                    : user
            )
        );
    };

    socket.on("active_users", handleActiveUsers);
    socket.on("last_seen_update", handleLastSeenUpdate);

    return () => {
        socket.off("active_users", handleActiveUsers);
        socket.off("last_seen_update", handleLastSeenUpdate);
    };
}, [socket]);



  return (
    <div ref={sidebarRef} className="h-full relative overflow-x-hidden scrollbar-track-hidden z-20 overflow-auto max-sm:absolute w-[320px] flex flex-col bg-base-200  border-r border-border-100 transition-all duration-700 ">
        <div className={`fixed w-[320px] z-[100] top-0 ${isScrolled && "bg-base-100"} transition-all`}>
            <div className="w-full flex p-3 pt-3 pb-2 items-center gap-1">
                <span className="text-[hsl(208,48%,44%)] mb-[5px]">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="48"
                    viewBox="0 -960 960 960"
                    width="48"
                    fill="currentColor"
                    >
                    <path d="M554-120q-54 0-91-37t-37-89q0-76 61.5-137.5T641-460q-3-36-18-54.5T582-533q-30 0-65 25t-83 82q-78 93-114.5 121T241-277q-51 0-86-38t-35-92q0-54 23.5-110.5T223-653q19-26 28-44t9-29q0-7-2.5-10.5T250-740q-10 0-25 12.5T190-689l-70-71q32-39 65-59.5t65-20.5q46 0 78 32t32 80q0 29-15 64t-50 84q-38 54-56.5 95T220-413q0 17 5.5 26.5T241-377q10 0 17.5-5.5T286-409q13-14 31-34.5t44-50.5q63-75 114-107t107-32q67 0 110 45t49 123h99v100h-99q-8 112-58.5 178.5T554-120Zm2-100q32 0 54-36.5T640-358q-46 11-80 43.5T526-250q0 14 8 22t22 8Z" />
                    </svg>
                </span>
                <span className="font-bold text-3xl shadow-[0_1px_0_rgba(0,0,0,0.06)]">Conversations</span>
            </div>
            <div className="flex items-center border-b border-border-100 justify-between">
                <button 
                    onClick={()=>{
                        if (tabActive.explore) setTabActive({chats: true, explore: false});
                        else setTabActive({chats: false, explore: true});
                    }} 
                    className={`p-2 transition-all flex items-center font-semibold gap-2 justify-center flex-1 py-3 hover:text-accent-100 border-b-[1.5px] ${tabActive.chats ? 'bg-accent-100/8 text-accent-100 border-accent-100' : 'border-transparent text-text-secondary '}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m580-512-60-34v-68l60-34 60 34v68l-60 34Zm0 92 140-80v-160l-140-80-140 80v160l140 80Zm-72 220h224q-7 26-24 42t-44 20L228-85q-33 5-59.5-15.5T138-154L85-591q-4-33 16-59t53-30l46-6v80l-36 5 54 437 290-36Zm-148-80q-33 0-56.5-23.5T280-360v-440q0-33 23.5-56.5T360-880h440q33 0 56.5 23.5T880-800v440q0 33-23.5 56.5T800-280H360Zm0-80h440v-440H360v440Zm220-220ZM218-164Z"/></svg>
                    <span>Chats</span>
                </button>
                <button 
                    onClick={()=>{
                        if (tabActive.chats) setTabActive({chats: false, explore: true});
                        else setTabActive({chats: true, explore: false});
                    }} 
                    className={`p-2 flex transition-all items-center justify-center font-semibold flex-1 gap-2 py-3 hover:text-accent-100 border-b-[1.5px] ${tabActive.explore ? 'bg-accent-100/8 text-accent-100 border-accent-100' : 'border-transparent text-text-secondary '}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m300-300 280-80 80-280-280 80-80 280Zm180-120q-25 0-42.5-17.5T420-480q0-25 17.5-42.5T480-540q25 0 42.5 17.5T540-480q0 25-17.5 42.5T480-420Zm0 340q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Zm0-320Z"/></svg>
                    <span>Explore</span>
                </button>
            </div>
        </div>
        <div className="pt-[130px]"></div>
        
        {tabActive.chats && <ChatsSideBarSection />}
        {tabActive.explore && <ChatsSideBarExplore />}
    </div>
  )
}

export default Sidebar