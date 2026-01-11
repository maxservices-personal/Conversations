import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useMessageStore } from "../../store/useMessagestore";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import Message from "../UIComponents/Message";
import MessageInput from "./MessageInput";
import { socket } from "../../lib/socket";
import { AnimatePresence, motion } from "framer-motion";
import TypingSVGLoader from "../UIComponents/TypingLoading";

const formatDateHeader = (dateString) => {
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

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return msgDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const MESSAGES_PER_LOAD = 40;
const SCROLL_THRESHOLD = 200;

const ChatContainer = ({ playSound }) => {
  const {
    messages,
    isGettingMessages,
    addMessage,
    addNewMessage,
    markAsSeen,
  } = useMessageStore();
  const { selectedFriend } = useChatStore();
  const { authUser } = useAuthStore();

  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  const [visibleMessages, setVisibleMessages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(MESSAGES_PER_LOAD);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFriendTyping, setIsFriendTyping] = useState(false);

  const prevLenRef = useRef(0);
  const messageRefs = useRef({});
  const scrollTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const isNearBottomRef = useRef(true);
  const initialLoadRef = useRef(false);
  const groupedMessages = visibleMessages.reduce((groups, msg) => {
    const header = formatDateHeader(
      msg.sending_time || msg.timestamp || msg.time
    );
    if (!groups[header]) groups[header] = [];
    groups[header].push(msg);
    return groups;
  }, {});

  const getDistanceFromBottom = useCallback(() => {
    const c = containerRef.current;
    if (!c) return Infinity;
    const { scrollTop, scrollHeight, clientHeight } = c;
    return scrollHeight - (scrollTop + clientHeight);
  }, []);

  const checkIfNearBottom = useCallback(() => {
    return getDistanceFromBottom() < SCROLL_THRESHOLD;
  }, [getDistanceFromBottom]);

  const scrollToBottom = useCallback((behavior = "auto") => {
    const c = containerRef.current;
    if (!c) return;
    if (behavior === "auto") {
      c.scrollTop = c.scrollHeight;
    } else {
      if (bottomRef.current)
        bottomRef.current.scrollIntoView({ behavior, block: "end" });
    }
    setUnreadCount(0);
    markAsSeen(selectedFriend._id);
    isNearBottomRef.current = true;
    setShowScrollButton(false);
  }, []);

  const scrollAndHighlight = useCallback((messageId) => {
    const target = document.getElementById(messageId);
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("highlight");
    setTimeout(() => target.classList.remove("highlight"), 2000);
  }, []);

  const handleScroll = useCallback(
    (e) => {
      if (scrollTimeoutRef.current) return;
      scrollTimeoutRef.current = setTimeout(() => {
        const container = e.target;
        const distanceFromBottom =
          container.scrollHeight -
          (container.scrollTop + container.clientHeight);
        const nearBottom = distanceFromBottom < SCROLL_THRESHOLD;
        isNearBottomRef.current = nearBottom;
        setShowScrollButton(!nearBottom);
        if (nearBottom) setUnreadCount(0);

        if (
          container.scrollTop === 0 &&
          !loadingOlder &&
          visibleMessages.length < messages.length
        ) {
          setLoadingOlder(true);
          const prevHeight = container.scrollHeight;
          const newCount = Math.min(
            visibleCount + MESSAGES_PER_LOAD,
            messages.length
          );
          const newStart = Math.max(messages.length - newCount, 0);
          const newSlice = messages.slice(newStart);
          setTimeout(() => {
            setVisibleMessages(newSlice);
            setVisibleCount(newCount);
            requestAnimationFrame(() => {
              const newHeight = container.scrollHeight;
              container.scrollTop = newHeight - prevHeight;
              setLoadingOlder(false);
            });
          }, 1200);
        }

        scrollTimeoutRef.current = null;
      }, 80);
    },
    [
      loadingOlder,
      visibleMessages.length,
      messages.length,
      visibleCount,
      messages,
    ]
  );

  useEffect(() => {
    if (!selectedFriend?._id) return;

    const handleReceiveMessage = (msg) => {
      if (
        String(msg.sender_id) !== String(selectedFriend._id) &&
        String(msg.receiver_id) !== String(selectedFriend._id)
      ) {
        addNewMessage(msg.sender_id);
        playSound();
        return;
      }

      const distance = getDistanceFromBottom();
      const wasNearBottom = distance < SCROLL_THRESHOLD;

      addMessage(msg);

      if (!wasNearBottom) {
        addNewMessage(msg.sender_id);
        setUnreadCount((p) => p + 1)
      };

      setVisibleMessages((prevVisible) => {
        const lastVisible = prevVisible[prevVisible.length - 1];
        if (!lastVisible) return [msg];
        return [...prevVisible, msg];
      });

      if (wasNearBottom) {
        requestAnimationFrame(() => {
          setTimeout(() => scrollToBottom("smooth"), 20);
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [selectedFriend?._id, addMessage, getDistanceFromBottom, scrollToBottom]);

  useEffect(() => {
    const handleDeleteMessage = ({ message_id }) => {
      setVisibleMessages((prev) =>
        prev.map((m) =>
          m.id === message_id
            ? { ...m, text: "This message was deleted", deleted: true }
            : m
        )
      );

      useMessageStore.getState().updateMessage(message_id, {
        text: "This message was deleted",
        deleted: true,
      });
    };

    socket.on("message_deleted", handleDeleteMessage);
    return () => socket.off("message_deleted", handleDeleteMessage);
  }, []);

  useEffect(() => {
    initialLoadRef.current = false;
    setVisibleMessages([]);
    setVisibleCount(MESSAGES_PER_LOAD);
    prevLenRef.current = 0;
    setUnreadCount(0);
  }, [selectedFriend?._id]);

  useEffect(() => {
    if (messages.length === 0) {
      setVisibleMessages([]);
      setVisibleCount(MESSAGES_PER_LOAD);
      prevLenRef.current = 0;
      return;
    }

    setVisibleMessages((prev) => {
      if (prev && prev.length > 0) {
        return prev;
      }
      const start = Math.max(messages.length - MESSAGES_PER_LOAD, 0);
      const slice = messages.slice(start);
      if (!initialLoadRef.current) {
        initialLoadRef.current = true;
        setTimeout(() => scrollToBottom("auto"), 0);
      }
      return slice;
    });

    prevLenRef.current = messages.length;
  }, [messages.length, scrollToBottom, selectedFriend?._id]);

  useLayoutEffect(() => {
    const prevLen = prevLenRef.current;
    const currLen = messages.length;
    if (currLen > prevLen) {
      setVisibleMessages((prevVisible) => {
        if (!prevVisible || prevVisible.length === 0) {
          prevLenRef.current = currLen;
          return prevVisible;
        }
        const lastPrevVisibleId = prevVisible[prevVisible.length - 1].id;
        const lastGlobalBeforeId = messages[prevLen - 1]?.id;
        if (lastPrevVisibleId === lastGlobalBeforeId) {
          const toAppend = messages.slice(prevLen);
          if (!toAppend || toAppend.length === 0) {
            prevLenRef.current = currLen;
            return prevVisible;
          }
          const newVisible = [...prevVisible, ...toAppend];
          prevLenRef.current = currLen;
          return newVisible;
        }
        prevLenRef.current = currLen;
        return prevVisible;
      });
    } else {
      prevLenRef.current = currLen;
    }
  }, [messages, visibleMessages.length]);

  useEffect(() => {
    return () => {
      messageRefs.current = {};
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setVisibleMessages([]);
    setVisibleCount(MESSAGES_PER_LOAD);
    setUnreadCount(0);
    prevLenRef.current = 0;
  }, [selectedFriend?._id]);

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

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full h-full overflow-auto pt-[78px] pb-[20px]"
    >
      {isGettingMessages && (
        <div className="w-full text-[#555] h-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 -960 960 960"
            className="threads-loader"
          >
            <path d="M554-120q-54 0-91-37t-37-89q0-76 61.5-137.5T641-460q-3-36-18-54.5T582-533q-30 0-65 25t-83 82q-78 93-114.5 121T241-277q-51 0-86-38t-35-92q0-54 23.5-110.5T223-653q19-26 28-44t9-29q0-7-2.5-10.5T250-740q-10 0-25 12.5T190-689l-70-71q32-39 65-59.5t65-20.5q46 0 78 32t32 80q0 29-15 64t-50 84q-38 54-56.5 95T220-413q0 17 5.5 26.5T241-377q10 0 17.5-5.5T286-409q13-14 31-34.5t44-50.5q63-75 114-107t107-32q67 0 110 45t49 123h99v100h-99q-8 112-58.5 178.5T554-120Zm2-100q32 0 54-36.5T640-358q-46 11-80 43.5T526-250q0 14 8 22t22 8Z" />
          </svg>
        </div>
      )}




      <div className="flex flex-col">
        {loadingOlder && (
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center text-[#555] justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 -960 960 960"
                className="threads-loader"
              >
                <path d="M554-120q-54 0-91-37t-37-89q0-76 61.5-137.5T641-460q-3-36-18-54.5T582-533q-30 0-65 25t-83 82q-78 93-114.5 121T241-277q-51 0-86-38t-35-92q0-54 23.5-110.5T223-653q19-26 28-44t9-29q0-7-2.5-10.5T250-740q-10 0-25 12.5T190-689l-70-71q32-39 65-59.5t65-20.5q46 0 78 32t32 80q0 29-15 64t-50 84q-38 54-56.5 95T220-413q0 17 5.5 26.5T241-377q10 0 17.5-5.5T286-409q13-14 31-34.5t44-50.5q63-75 114-107t107-32q67 0 110 45t49 123h99v100h-99q-8 112-58.5 178.5T554-120Zm2-100q32 0 54-36.5T640-358q-46 11-80 43.5T526-250q0 14 8 22t22 8Z" />
              </svg>
            </div>
            <div className="text-center loader-clasic text-sm ">
              Loading Older Conversation
            </div>
          </div>
        )}

        {Object.keys(groupedMessages).map((dateLabel) => (
          <div key={dateLabel} className="relative">
            <div className="text-center text-sm z-10 sticky top-3 text-gray-500 my-6">
              <span className="bg-[#f9f9f99a] px-3 py-1 backdrop-blur-lg rounded-full border border-gray-300">
                {dateLabel}
              </span>
            </div>
            {groupedMessages[dateLabel].map((message, index) => (
              <div key={message.id}>
                <Message
                  ref={(el) => (messageRefs.current[message.id] = el)}
                  message={message}
                  index={index}
                  onScrollTo={scrollAndHighlight}
                  fromSender={message.sender_id === authUser._id}
                />
              </div>
            ))}
          </div>
        ))}
        <AnimatePresence>
          {isFriendTyping && (
            <TypingSVGLoader />
          )}
        </AnimatePresence>
        <div style={{ height: "120px" }} />
        <div ref={bottomRef} />
      </div>

      {showScrollButton && (
        <motion.button
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-20 right-10 p-3 rounded-full border border-token-border-medium bg-[#ffffff7a] backdrop-blur-md shadow-lg hover:bg-[#ffffffaa] transition-colors"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="relative">
            {unreadCount > 0 && (
              <span className="absolute bottom-2 left-2 bg-token-primary text-white text-sm rounded-full w-6 h-6 font-semibold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <svg
              width="18"
              className="rotate-90"
              height="18"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6.02925 3.02929C6.25652 2.80202 6.60803 2.77382 6.86616 2.94433L6.97065 3.02929L11.4707 7.52929C11.7304 7.78899 11.7304 8.211 11.4707 8.4707L6.97065 12.9707C6.71095 13.2304 6.28895 13.2304 6.02925 12.9707C5.76955 12.711 5.76955 12.289 6.02925 12.0293L10.0585 7.99999L6.02925 3.9707L5.94429 3.8662C5.77378 3.60807 5.80198 3.25656 6.02925 3.02929Z"></path>
            </svg>
          </div>
        </motion.button>
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
