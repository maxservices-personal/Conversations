// Message.jsx
import React, { forwardRef, useRef, useEffect, useImperativeHandle } from 'react'
import { Reply } from 'lucide-react'
import SingleTypeButton from './SingleTypeButton'
import { useMessageStore } from '../../store/useMessagestore'
import { useChatStore } from '../../store/useChatStore'
import { useAuthStore } from '../../store/useAuthStore'
import { axiosInstance } from '../../lib/axios'
import { socket } from '../../lib/socket'

function formatTo12Hour(timeString) {
  const date = new Date(timeString.replace(" ", "T"));
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = String(minutes).padStart(2, "0");
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}



const Message = forwardRef(({ message, fromSender, index, onScrollTo }, ref) => {
  const { setReplyingData,removeMessage } = useMessageStore();
  const { selectedFriend } = useChatStore();
  const { authUser } = useAuthStore();
  const wrapperRef = useRef(null);

  const isEmojiOnly = (text) => {
  const trimmed = text.trim();

  const emojiRegex =
    /^(?:[\p{Emoji_Presentation}\p{Emoji}\u200d\uFE0F]+)$/u;

  return emojiRegex.test(trimmed);
};

  useImperativeHandle(ref, () => ({
    highlight: (opts = { scrollBehavior: "smooth", block: "center" }) => {
      const el = wrapperRef.current;
      if (!el) return;
      if (typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: opts.scrollBehavior, block: opts.block });
      }
      el.classList.add("highlight-anim");
      setTimeout(() => {
        el.classList.remove("highlight-anim");
      }, 1000);
    },
    domNode: () => wrapperRef.current,
  }));

  const handleReplyClick = (replyMessageId) => {
    console.log(replyMessageId)
    if (!replyMessageId) return;
    if (typeof onScrollTo === "function") {
        onScrollTo(replyMessageId);
    }
  };

  const handleDelete = (id) => {
    console.log(id)
    removeMessage(id);
    socket.emit("delete_message", { message_id: id, friend_id: selectedFriend._id });
  };
 
  if (message.deleted) return;

  return (
    <div
      ref={wrapperRef}
      key={index+message.id}
      id={message.id}
      className={`w-full flex items-center onHoverShow ${fromSender ? "justify-end" : "justify-start"} py-1`}
    >
      {fromSender && (
        <>
            <SingleTypeButton
                OnChick={() => handleDelete(message.id)}
                className="onHoverShowTarget mr-0 bg-transparent border-none backdrop-blur-sm"
                >
                <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
            </SingleTypeButton>
            <SingleTypeButton OnChick={()=>{
            setReplyingData({
                text: message.text,
                replying_to: authUser.name,
                message_id: message.id
            })
            }} className='onHoverShowTarget rotate-180 mr-2 bg-transparent border-none backdrop-blur-sm'>
            <Reply size={18} />
            </SingleTypeButton>
        </>
      )}

      <div
        className={`${fromSender ? " text-[var(--token-primary-text)] bg-[var(--token-user-selected)] mr-4 md:mr-10" : "bg-token-base-200 ml-4 md:ml-10"} shadow-md ${isEmojiOnly(message.text) && !message.reply?.text && "bg-[transparent!important] shadow-none"} inside-msg ${message.reply?.text ? "p-1" : "p-2 px-4"} whitespace-pre-wrap overflow-hidden max-w-[70%] rounded-3xl `}
      >
        {message.reply?.text && (
          <div
            onClick={() => handleReplyClick(message.reply.message_id)}
            className="cursor-pointer overflow-hidden min-h-[80px] min-w-[240px] pt-2 rounded-t-3xl mb-2 pb-1 mx-[1px] bg-[#d1d1d183]"
          >
            <div className="ml-4 flex items-center justify-between">
              <div className={`flex items-center gap-2`}>
                <Reply className={message.reply.replying_to === authUser.name && "rotate-180"} size={18} />
                <span className="font-semibold text-[14px]">{message.reply.replying_to}</span>
              </div>
            </div>

            <div
              className={`mb-2 mt-2 h-full ml-4 pl-5 max-h-[150px] rounded-md flex items-center border-l-4 ${
                message.reply.replying_to === authUser.name ? "border-token-primary" : "border-[#f7f7f7]"
              }`}
            >
              <span className={`max-h-[120px] max-w-[95%] ${fromSender ? "text-[var(--token-primary-text)]" : "text-[#565656]"} overflow-hidden text-ellipsis`}>
                {message.reply.text}
              </span>
            </div>
          </div>
        )}

        {message.reply?.text ? (
          <span className="p-2 pt-0 block">{message.text}</span>
        ) : (
          <span className={`${isEmojiOnly(message.text) ? "text-4xl" : ""}`}>{message.text}</span>
        )}
        {message.sending_time && (
          <div className={`font-semibold text-[12px] ${fromSender && !isEmojiOnly(message.text) ? "text-[var(--token-primary-text-2)] text-right" : "text-[#757575] text-left"} mt-1 mb-1 ${message.reply?.text ? "mr-3 mb-1" : ""} ${!fromSender && message.reply?.text ? "ml-3" : ""}`}>
            {formatTo12Hour(message.sending_time)}
          </div>
        )}
      </div>

      {!fromSender && (
        <SingleTypeButton OnChick={()=>{
          setReplyingData({
            text: message.text,
            replying_to: selectedFriend.name,
            message_id: message.id
          })
        }} className='onHoverShowTarget ml-2 bg-transparent border-none backdrop-blur-sm'>
          <Reply size={18} />
        </SingleTypeButton>
      )}
    </div>
  );
});

export default Message;
