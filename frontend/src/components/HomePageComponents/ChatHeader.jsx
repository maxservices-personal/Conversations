import React, { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { Ellipsis, Search, User, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import SingleTypeButton from "../UIComponents/SingleTypeButton";
import { useUIStore } from "../../store/useUIStore";
import { motion } from "framer-motion";
import { useMessageStore } from "../../store/useMessagestore";
import { socket } from "../../lib/socket";
import UserAvatar from "../SidebarComponents/addons/UserAvatar";
import Handle from "../SidebarComponents/addons/Handle";


const formatDate = (dateString) => {
  const msgDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    msgDate.getDate() === today.getDate() &&
    msgDate.getMonth() === today.getMonth() &&
    msgDate.getFullYear() === today.getFullYear();

  const isYesterday =
    msgDate.getDate() === yesterday.getDate() &&
    msgDate.getMonth() === yesterday.getMonth() &&
    msgDate.getFullYear() === yesterday.getFullYear();

  const formatTo12Hour = () => {
    const hours = msgDate.getHours();
    const mins = msgDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
  }

  if (isToday) return "Today, " + formatTo12Hour();
  if (isYesterday) return "Yesterday";
  return msgDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ChatHeader = () => {
  const { selectedFriend, setSelectedFriend } = useChatStore();
  const { toggleSidebar, isSidebarOpen } = useUIStore();
  const { activeUsers } = useAuthStore();
  const { new_messages } = useMessageStore();
  const isActive = activeUsers.some((u) => u.user_id === selectedFriend._id);
  const [isContactInfo, setIsContactInfo] = useState(false);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  console.log(selectedFriend)

  useEffect(() => {
    if (!socket) return;

    socket.on("typing", ({ senderId }) => {
      if (senderId === selectedFriend._id) setIsFriendTyping(true);
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === selectedFriend._id) setIsFriendTyping(false);
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, selectedFriend]);

  const getStatusText = (friend) => {
    if (isActive) {
      return "Currently Active";
    }
    
    if (friend.last_seen) {
      return `Last seen ${formatDate(friend.last_seen)}`;
    }
    return null;
  };
  return (
    <>
      <div className="w-full flex items-start pt-2 z-[200] absolute top-0 left-0 justify-between h-[120px] border-token-border-medium gradient-blur ">
        <div
          onClick={() => setIsContactInfo(!isContactInfo)}
          className="flex select-none cursor-pointer items-center ml-2"
        >
          <button onClick={() => setSelectedFriend(null)} className="p-1 ml-1 mr-1 hover:text-[#000000] text-[#545454]">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>
          </button>
          <UserAvatar user={selectedFriend} />
          <div className="ml-2">
            <span className="block text-[#141414] text-[20px] font-bold leading-7 ">
              {selectedFriend.name}
            </span>
            {getStatusText(selectedFriend) ? (
              <span className="block text-[14px] text-[#8f8f8f] font-semibold">
                {isFriendTyping ? "Typing..." : getStatusText(selectedFriend)}
              </span>
            ) : (
              <Handle handle={selectedFriend.username} />
            )}
          </div>
        </div>
        <div
          className={`max-md:${
            isContactInfo ? "mr-[410px]" : "mr-3"
          } mr-3 transition-all flex items-center`}
        >
          <SingleTypeButton className={"mr-2"}>
            <Search />
          </SingleTypeButton>
          <SingleTypeButton OnChick={() => setSelectedFriend(null)}>
            <Ellipsis className="rotate-90" />
          </SingleTypeButton>
          <SingleTypeButton
            OnChick={() => toggleSidebar(true)}
            className={
              "ml-2  bg-[#ffffff29] block sm:hidden border-none backdrop-blur-sm"
            }
          >
            {isSidebarOpen ? (
              <X />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                data-rtl-flip=""
              >
                {new_messages.length != 0 && (
                  <circle cx="15" cy="6" r="4" fill="#0285FF"></circle>
                )}
                <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path>
              </svg>
            )}
          </SingleTypeButton>
        </div>
      </div>
      {/* {isContactInfo && (
        <motion.div
          initial={{ right: -550 }}
          animate={{ right: 0 }}
          transition={{ duration: 0.5, ease: "easeIn" }}
          className="z-[210] flex flex-col items-center right-0 absolute fade-in-animate-normal top-0 w-[400px] bg-[#fafafaa6] backdrop-blur-md border-l border-token-border-medium h-full"
        >
          <div className="w-full h-[61px] px-4 mt-1 border-b border-token-border-light flex items-center justify-between">
            <span className="font-semibold text-[20px]">Contact Info</span>
            <SingleTypeButton OnChick={() => setIsContactInfo(!isContactInfo)}>
              <X />
            </SingleTypeButton>
          </div>
          <div className="w-24 mt-14 h-24 relative rounded-full flex items-center justify-center bg-white border border-token-border-medium">
            {selectedFriend?.profilePic ? (
              <img
                src={selectedFriend?.profilePic}
                alt="profilepic"
                className="rounded-full w-full h-full object-cover"
              />
            ) : (
              <div className="">
                <User size={36} />
              </div>
            )}
          </div>
          <span className="mt-3 text-[24px] font-semibold">
            {selectedFriend?.name}
          </span>
          <span className="mt-2 text-[#555]">
            @{selectedFriend?.username}
            {selectedFriend?.phone_number == ""
              ? null
              : ` | ${selectedFriend?.phone_number}`}
          </span>
          {isActive && (
            <span className="font-semibold text-green-500 text-[12px] mt-2">
              Currently Active
            </span>
          )}

          <hr className="border-token-border-medium mt-10 w-[90%]" />
          <div className="flex mt-5 w-[90%] flex-col ml-1">
            <span className="font-semibold text-[#121212] ">Bio</span>
            <span>{selectedFriend?.bio}</span>
          </div>
          <div className="mt-auto mb-4 p-4 gap-3 bg-white rounded-2xl w-[90%] h-fit border-token-border-medium border flex flex-col">
            <button className="px-4 py-2 border hover:bg-[#dbdbdb88] border-token-border-light flex items-center gap-2 rounded-2xl">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentColor"
                >
                  <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z" />
                </svg>
              </span>
              <span>Add to Favourates</span>
            </button>
            <button className="px-4 py-2 border hover:bg-[#dbdbdb88] border-token-border-light flex items-center gap-2 rounded-2xl">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentColor"
                >
                  <path d="m480-240 160-160-56-56-64 64v-168h-80v168l-64-64-56 56 160 160ZM200-640v440h560v-440H200Zm0 520q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v499q0 33-23.5 56.5T760-120H200Zm16-600h528l-34-40H250l-34 40Zm264 300Z" />
                </svg>
              </span>
              <span>Archive</span>
            </button>
            <button className="px-4 py-2 text-red-500 hover:bg-[#ff35353e] border border-token-border-light flex items-center gap-2 rounded-2xl">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentColor"
                >
                  <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z" />
                </svg>
              </span>
              <span>Report {selectedFriend?.name}</span>
            </button>
            <button className="px-4 py-2 text-red-500 border hover:bg-[#ff35353e] border-token-border-light flex items-center gap-2 rounded-2xl">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentColor"
                >
                  <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-124q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 448ZM480-480Z" />
                </svg>
              </span>
              <span>Block {selectedFriend?.name}</span>
            </button>
            <button className="px-4 py-2 text-red-500 border hover:bg-[#ff35353e] border-token-border-light flex items-center gap-2 rounded-2xl">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentColor"
                >
                  <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
              </span>
              <span>Delete chat</span>
            </button>
          </div>
        </motion.div>
      )} */}
    </>
  );
};

export default ChatHeader;
