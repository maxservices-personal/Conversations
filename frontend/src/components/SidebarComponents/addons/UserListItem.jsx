import React from "react";
import UserAvatar from "./UserAvatar";
import Handle from "./Handle";
import { useMessageStore } from "../../../store/useMessagestore";
import { useChatStore } from "../../../store/useChatStore";
import { useUIStore } from "../../../store/useUIStore";

const UserListItem = ({ user, index }) => {
    const { selectedFriend, setSelectedFriend } = useChatStore()
    const { getMessages, setMessages, setReplyingData, markAsSeen, getNewMessageCount, getNewMessage } = useMessageStore();
    const { toggleSidebar, toggleIsOnStandBy } = useUIStore();
    
  return (
    <div
      key={`euser-s-index-${user._id}-${user.username}`}
      className={`w-full flex items-center gap-2 border-b border-border-100/30 p-1 py-3 hover:bg-accent-200/10 ${selectedFriend == user && "bg-base-100"}`}
      onClick={() => {
        toggleIsOnStandBy();
        toggleSidebar(false);
        setMessages([]);
        setSelectedFriend(null);
        setReplyingData({});
        markAsSeen(user._id);
        setTimeout(() => {
          toggleIsOnStandBy();
          if (selectedFriend?._id == user._id) {
            setSelectedFriend(null);
          } else {
            setSelectedFriend(user);
            getMessages(user._id);
          }
        }, 1000);
      }}
    >
      <UserAvatar user={user} />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary ">{user.name}</span>
        </div>
        <span className="flex items-center justify-between">            
            {getNewMessage(user._id) != "" ? (
                <span className="text-sm text-tertiary">{getNewMessage(user._id)}</span>
            ) : (
                <Handle handle={user.username} />
            )}
            {getNewMessageCount(user._id) != 0 && (<span className="p-1 bg-accent-100/20 text-accent-100 rounded-full">{getNewMessageCount(user._id)}</span>)}
        </span>
      </div>
    </div>
  );
};

export default UserListItem;
