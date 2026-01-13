import { Ellipsis, LogOut, Plus, RefreshCw, Settings, User, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useMessageStore } from "../store/useMessagestore";
import { socket } from "../lib/socket";
import { useUIStore } from "../store/useUIStore";
import SingleTpyeButton from "../components/UIComponents/SingleTypeButton"
import Profile from "./UIComponents/Profile";



const Sidebar = () => {
  const [searchInputValue, setSearchInputValue] = useState("");
  const [isSearchInputFocus, setIsSearchInputFocus] = useState(false);
  const [isFindUsers, setIsFindUsers] = useState(false);
  const [isErrorInProfilePic, setIsErrorInProfilePic] = useState(false);
  const {
    authUser,
    activeUsers,
    setActiveUsers,
    users,
    getUsers,
    friends,
    getFriends,
    isGettingFriends,
    isGettingUsers,
    addFriend,
    logout,
    friend_requests
  } = useAuthStore();

  const { selectedFriend, setSelectedFriend } = useChatStore()
  const { getMessages, setMessages, setReplyingData, markAsSeen, getNewMessageCount, getNewMessage } = useMessageStore();
  const { isSidebarOpen, toggleSidebar, toggleIsSettingsOpen, toggleIsOnStandBy ,setIsAddMoment, isAddMoment } = useUIStore();
  const [friendTyping, setFriendTyping] = useState({
    userId: null
  });

  useEffect(() => {
    socket.emit("join", { _id: authUser?._id });
  }, []);

  useEffect(() => {
    socket.on("active_users", (list) => setActiveUsers(list));

    return () => {
      socket.off("active_users");
    };
  }, []);



  const [requestedUsers, setRequestedUsers] = useState([]);

  const handleFollow = (userId) => {
    setRequestedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId) 
        : [...prev, userId] 
    );
    addFriend(userId);
  };






  return (
    <>
      <div className={`h-full relative z-20 max-sm:absolute w-[320px] p-2 bg-[#f0f0f06d] backdrop-blur-md sm:backdrop-blur-none sm:bg-token-base-200-blured border-r border-token-border-medium transition-all duration-700 ${!isSidebarOpen ? "left-[-100%]" : "left-0"} sm:left-0`}>
        <div className="flex text-[#121212] items-center pl-2 mt-1 justify-between">
          <div className="flex gap-2 fade-in-animate-new items-center">
            <span className="text-[#727272]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="36"
                viewBox="0 -960 960 960"
                width="36"
                fill="currentColor"
              >
                <path d="M554-120q-54 0-91-37t-37-89q0-76 61.5-137.5T641-460q-3-36-18-54.5T582-533q-30 0-65 25t-83 82q-78 93-114.5 121T241-277q-51 0-86-38t-35-92q0-54 23.5-110.5T223-653q19-26 28-44t9-29q0-7-2.5-10.5T250-740q-10 0-25 12.5T190-689l-70-71q32-39 65-59.5t65-20.5q46 0 78 32t32 80q0 29-15 64t-50 84q-38 54-56.5 95T220-413q0 17 5.5 26.5T241-377q10 0 17.5-5.5T286-409q13-14 31-34.5t44-50.5q63-75 114-107t107-32q67 0 110 45t49 123h99v100h-99q-8 112-58.5 178.5T554-120Zm2-100q32 0 54-36.5T640-358q-46 11-80 43.5T526-250q0 14 8 22t22 8Z" />
              </svg>
              {/* <svg xmlns="http://www.w3.org/2000/svg"
        width="36" height="36" viewBox="0 -960 960 960"
        class="threads-loader" aria-hidden="true" role="img">
      

      <path d="M554-120q-54 0-91-37t-37-89q0-76 61.5-137.5T641-460q-3-36-18-54.5T582-533q-30 0-65 25t-83 82q-78 93-114.5 121T241-277q-51 0-86-38t-35-92q0-54 23.5-110.5T223-653q19-26 28-44t9-29q0-7-2.5-10.5T250-740q-10 0-25 12.5T190-689l-70-71q32-39 65-59.5t65-20.5q46 0 78 32t32 80q0 29-15 64t-50 84q-38 54-56.5 95T220-413q0 17 5.5 26.5T241-377q10 0 17.5-5.5T286-409q13-14 31-34.5t44-50.5q63-75 114-107t107-32q67 0 110 45t49 123h99v100h-99q-8 112-58.5 178.5T554-120Zm2-100q32 0 54-36.5T640-358q-46 11-80 43.5T526-250q0 14 8 22t22 8Z" />
    </svg> */}
            </span>
            <span className="font-semibold text-[24px]">Conversations</span>
          </div>
          {/* <button onClick={()=>logout()} className="p-2 rounded-2xl border border-token-border-medium bg-white"> 
            <LogOut />
          </button> */}
        </div>
        <hr className="mt-4 border-token-border-light" />
        <div className="pt-4 h-[calc(100%-54px)] w-full overflow-y-auto overflow-x-hidden">
          <div className="w-full flex relative gap-1 items-center">
            <input
              type="text"
              onFocus={() => {
                if (!users) getUsers();
                setIsSearchInputFocus(true);
              }}
              value={searchInputValue}
              onBlur={() => setIsSearchInputFocus(false)}
              onChange={(e) => setSearchInputValue(e.target.value)}
              className="p-2 w-full px-3 rounded-2xl border border-token-border-medium outline-none focus:border-token-primary"
              placeholder="Search users"
            />
            <button
              onClick={() => {if (!isFindUsers || users.length == 0) {
                  getUsers()
              }
              setIsFindUsers(!isFindUsers)}}
              className="p-2 text-[#121212] border border-token-border-medium rounded-2xl bg-white hover:bg-[#dbdbdb88] active:scale-90 "
            >
              <Plus className={`transition-all ${isFindUsers && "rotate-45"}`} />
            </button>
            {isSearchInputFocus && (
              <div className="p-1 absolute w-full top-12 rounded-2xl border border-token-border-medium z-[100] bg-token-base-100">
                {users.len != 0 &&
                  users
                    .filter((user) =>
                      user.username
                        .toLowerCase()
                        .includes(searchInputValue.toLowerCase())
                    )
                    .map((user) => (
                      <div
                        key={user.sid}
                        className="p-2 rounded-lg hover:bg-token-base-300 cursor-pointer flex items-center gap-3"
                      >
                        <div className="rounded-full bg-token-border-medium flex items-center justify-center font-semibold">
                          {user.username}
                        </div>
                      </div>
                    ))}
              </div>
            )}
          </div>
            <div className="text-[#121212] font-semibold mt-3 ml-2">Moments</div>
            <div className="flex items-center gap-3 ml-2 mt-2 max-w-full w-full overflow-y-hidden overflow-auto">
              <div onClick={()=>setIsAddMoment(!isAddMoment)} className="cursor-pointer rounded-full p-0.5 ">
                <div className="w-14 h-14  relative bg-token-base-200 rounded-full flex items-center justify-center border-2 border-token-border-medium">
                  {authUser.profilePic && !isErrorInProfilePic ? (
                    <img onError={()=>setIsErrorInProfilePic(true)} src={authUser.profilePic} alt={authUser.name} className="rounded-full w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#555]">
                      <User size={20} />
                    </div>
                  )}
                  <div className="p-1 flex items-center justify-center rounded-full bg-token-base-100 absolute -bottom-1 -right-1 border border-token-border-medium">
                    <Plus size={12} />
                  </div>
                </div>
              </div>
            </div>

          {!isFindUsers ? (
            <>
              <div className="flex items-center gap-1 mt-5 ml-2">
                <span className="text-[#121212] font-semibold select-none">Friends</span>
                <button
                  onClick={() => getFriends()}
                  className="p-1 text-[#252525] rounded-2xl border bg-white border-token-border-medium"
                >
                  <RefreshCw
                    className={isGettingFriends && "animate-spin"}
                    size={16}
                  />
                </button>
              </div>
              <div className="mt-2"></div>
              {isGettingFriends ? (
                <div className="flex items-center justify-center text-[#424242] h-[70%]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="44"
                    height="44"
                    viewBox="0 -960 960 960"
                    class="threads-loader"
                    aria-hidden="true"
                    role="img"
                  >
                    <path d="M554-120q-54 0-91-37t-37-89q0-76 61.5-137.5T641-460q-3-36-18-54.5T582-533q-30 0-65 25t-83 82q-78 93-114.5 121T241-277q-51 0-86-38t-35-92q0-54 23.5-110.5T223-653q19-26 28-44t9-29q0-7-2.5-10.5T250-740q-10 0-25 12.5T190-689l-70-71q32-39 65-59.5t65-20.5q46 0 78 32t32 80q0 29-15 64t-50 84q-38 54-56.5 95T220-413q0 17 5.5 26.5T241-377q10 0 17.5-5.5T286-409q13-14 31-34.5t44-50.5q63-75 114-107t107-32q67 0 110 45t49 123h99v100h-99q-8 112-58.5 178.5T554-120Zm2-100q32 0 54-36.5T640-358q-46 11-80 43.5T526-250q0 14 8 22t22 8Z" />
                  </svg>
                </div>
              ) : friends.length != 0 ? (
                friends.map((user, index) => {
                  const isActive = activeUsers.some(u => u.user_id === user._id);

                  
                  return (
                  <div onClick={()=>{
                    toggleIsOnStandBy();
                    toggleSidebar(false);
                    setMessages([]);
                    setSelectedFriend(null);
                    setReplyingData({});
                    markAsSeen(user._id)
                    setTimeout(() => {
                      toggleIsOnStandBy()
                      if (selectedFriend?._id == user._id) {
                      setSelectedFriend(null);
                    } else {
                      setSelectedFriend(user);
                      getMessages(user._id);
                    }
  }, 1000);
                  
                  }} key={index + "Asdasd" + user.name} className={`w-[98%] select-none ml-1 rounded-3xl border border-transparent ${selectedFriend?._id === user._id && "bg-white"} hover:border-token-border-medium transition-all flex items-center hover:bg-white p-1 gap-2`}>
                    <div className="w-14 h-14 relative bg-white rounded-full flex items-center justify-center border border-token-border-medium">
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.name} className="rounded-full w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#555]">
                          <User size={24} />
                        </div>
                      )}
                      {isActive  && (
                        <div className="w-4 h-4 rounded-full z-10 bg-green-500 border border-white absolute right-0 top-0">
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="block font-semibold">{user.name}</span>
                      {isActive ? (
                        <span className="block text-[12px] text-[#5f5f5f] font-semibold">{friendTyping[user._id] ? "Typing..." : "Active Now!"}</span>
                      ) : (
                        <span className="block text-[14px] text-[#8f8f8f]">@{user.username}</span>
                      )}
                      <span className="block text-[14px] text-[#8f8f8f]">{getNewMessage(user._id)}</span>
                    </div>
                    {getNewMessageCount(user._id) === 0 ? (
                      <div className="ml-auto">
                        <span className="text-[#676767] gap-1 text-[12px] flex items-center px-4 py-2  rounded-3xl border-token-border-medium border mr-2"><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip=""><path d="M6.02925 3.02929C6.25652 2.80202 6.60803 2.77382 6.86616 2.94433L6.97065 3.02929L11.4707 7.52929C11.7304 7.78899 11.7304 8.211 11.4707 8.4707L6.97065 12.9707C6.71095 13.2304 6.28895 13.2304 6.02925 12.9707C5.76955 12.711 5.76955 12.289 6.02925 12.0293L10.0585 7.99999L6.02925 3.9707L5.94429 3.8662C5.77378 3.60807 5.80198 3.25656 6.02925 3.02929Z"></path></svg></span>
                      </div>
                    ) : (
                      <div className="p-1 w-6 h-6 mr-2 text-[12px] flex items-center justify-center font-semibold ml-auto text-white rounded-full bg-token-primary">
                        {getNewMessageCount(user._id)}
                      </div>
                    )}
                  </div>
                )})
              ) : (
                <div className="flex items-center justify-center h-[70%]">
                  <span className="text-[#424242] w-[66.6%] text-center">
                    Ops! you don't have friends added.{" "}
                    <span
                      className="cursor-pointer text-token-primary font-semibold"
                      onClick={() => setIsFindUsers(!isFindUsers)}
                    >
                      Add friends!
                    </span>
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              {friend_requests.length != 0 && (
                <div className="mt-2 ml-2 p-3 px-4 bg-token-base-100 shadow-md rounded-3xl border-token-border-medium border">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#121212] font-semibold">Added you as friend</span>
                    <button
                      // onClick={() => getUsers()}
                      className="p-1 text-[#252525] rounded-2xl border bg-white border-token-border-medium"
                    >
                      <RefreshCw
                        className={isGettingUsers && "animate-spin"}
                        size={16}
                      />
                    </button>
                  </div>
                  <div className="mt-3"></div>
                  {friend_requests.map((user) => {
                      if (user._id === authUser._id) return null;

                      const isFriend = friends.some(
                        (friend) => friend._id === user._id
                      );
                    if (isFriend) {return <></>}


                      return (
                        user.isSetUp && isFriend && (
                          <div
                            key={user._id}
                            className="flex mb-2 gap-2 relative items-center w-full"
                          >
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-token-border-medium">
                              {!user?.profilePic ? (
                                <div className="w-full h-full flex items-center justify-center text-[#555]">
                                  <User size={24} />
                                </div>
                              ) : (
                                <img
                                  src={user.profilePic}
                                  alt={user.name}
                                  className="rounded-full w-full h-full object-cover"
                                />
                              )}
                            </div>

                            <div>
                              <span className="font-semibold block whitespace-nowrap max-w-[80px] text-ellipsis">
                                {user.name}
                              </span>
                              <span className="text-[14px] block text-[#373737]">
                                @{user.username}
                              </span>
                            </div>

                            {isFriend ? (
                              <button className="px-4 text-[14px] mr-2 text-gray-600 font-semibold py-2 rounded-3xl border cursor-default border-gray-300 ml-auto">
                                Friends
                              </button>
                            ): (
                              <div className="absolute right-0 bg-[#ffffff9a] pl-2 ">
                                <button
                                  onClick={() => handleFollow(user._id)}
                                  className="px-4 text-[14px] mr-2 ml-auto font-semibold py-2 rounded-3xl border border-token-border-medium bg-token-primary text-white hover:opacity-90 transition-all"
                                >
                                  Add back
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      );
                    })}
                </div>
              )}
              <div className="flex items-center gap-1 mt-5 ml-2">
                <span className="text-[#121212] font-semibold">Find Friends</span>
                <button
                  onClick={() => getUsers()}
                  className="p-1 text-[#252525] rounded-2xl border bg-white border-token-border-medium"
                >
                  <RefreshCw
                    className={isGettingUsers && "animate-spin"}
                    size={16}
                  />
                </button>
              </div>
              {isGettingUsers ? (
                <div className="flex items-center text-[#555555] justify-center h-[70%]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 -960 960 960"
                    class="threads-loader"
                    aria-hidden="true"
                    role="img"
                  >
                    <path d="M554-120q-54 0-91-37t-37-89q0-76 61.5-137.5T641-460q-3-36-18-54.5T582-533q-30 0-65 25t-83 82q-78 93-114.5 121T241-277q-51 0-86-38t-35-92q0-54 23.5-110.5T223-653q19-26 28-44t9-29q0-7-2.5-10.5T250-740q-10 0-25 12.5T190-689l-70-71q32-39 65-59.5t65-20.5q46 0 78 32t32 80q0 29-15 64t-50 84q-38 54-56.5 95T220-413q0 17 5.5 26.5T241-377q10 0 17.5-5.5T286-409q13-14 31-34.5t44-50.5q63-75 114-107t107-32q67 0 110 45t49 123h99v100h-99q-8 112-58.5 178.5T554-120Zm2-100q32 0 54-36.5T640-358q-46 11-80 43.5T526-250q0 14 8 22t22 8Z" />
                  </svg>
                </div>
              ) : (
                <div className="w-full">
                  <div className="mb-4"></div>
                  {users.map((user) => {
                    if (user._id === authUser._id) return null;

                    const isFriend = friends.some(
                      (friend) => friend._id === user._id
                    );

                    const isRequested = requestedUsers.includes(user._id);
                    const hasPendingRequest = user.addedOneSide;

                    return (
                      user.isSetUp && (
                        <div
                          key={user._id}
                          className="flex mb-2 gap-2 ml-2 items-center w-full"
                        >
                          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-token-border-medium">
                            {/* {!user?.profilePic ? (
                              <div className="w-full h-full flex items-center justify-center text-[#555]">
                                <User size={24} />
                              </div>
                            ) : (
                              <img
                                src={user.profilePic}
                                alt={user.name}
                                className="rounded-full w-full h-full object-cover"
                              />
                            )} */}
                            <Profile isActive={false} user={user} size={14} />
                          </div>

                          <div>
                            <span className="font-semibold block">
                              {user.name}
                            </span>
                            <span className="text-[14px] block text-[#373737]">
                              @{user.username}
                            </span>
                          </div>

                          {isFriend ? (
                            <button className="px-4 text-[14px] mr-2 text-gray-600 font-semibold py-2 rounded-3xl border cursor-default border-gray-300 ml-auto">
                              Friends
                            </button>
                          ) : hasPendingRequest || isRequested ? (
                            <button
                              onClick={() => handleFollow(user._id)}
                              className="px-4 text-[14px] mr-2 ml-auto font-semibold py-2 rounded-3xl border border-gray-300 text-gray-600 bg-gray-100"
                            >
                              Requested
                            </button>
                          ) : (
                            <button
                              onClick={() => handleFollow(user._id)}
                              className="px-4 text-[14px] mr-2 ml-auto font-semibold py-2 rounded-3xl border border-token-border-medium bg-token-primary text-white hover:opacity-90 transition-all"
                            >
                              Add Friend
                            </button>
                          )}
                        </div>
                      )
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        <div className="absolute bottom-0 left-1 right-1 w-[100%-1px] backdrop-blur-lg">
          <div onClick={()=>toggleIsSettingsOpen()} className="mt-auto mr-1 mb-2 cursor-pointer hover:bg-[#ebebebb4] flex items-center gap-2 bg-[#ffffff7c] backdrop-blur-md rounded-3xl border border-token-border-medium p-2 py-2 ">
            <div className="w-14 h-14 relative bg-token-base-200 rounded-full flex items-center justify-center border border-token-border-medium">
                {authUser.profilePic && !isErrorInProfilePic ? (
                  <img onError={()=>setIsErrorInProfilePic(true)} src={authUser.profilePic} alt={authUser.name} className="rounded-full w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#555]">
                    <User size={20} />
                  </div>
                )}
                <div className="p-1 rounded-full bg-token-base-100 absolute bottom-0 right-0 border border-token-border-medium">
                  <Plus size={12} />
                </div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[15px] font-semibold">{authUser.name} <span className="text-[#4d4d4d]">(You)</span></span>
                <span className="text-[13px] text-[#646464]">{authUser.email}</span>
              </div>
              <div className="ml-auto">
                <SingleTpyeButton>
                  <Ellipsis size={16} className="" />
                </SingleTpyeButton>
              </div>
          </div>
        </div>
      </div>
      </>
  );
};

export default Sidebar;
