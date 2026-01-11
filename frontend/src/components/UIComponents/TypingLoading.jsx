import React from "react";
import { motion } from "framer-motion";
import Profile from "./Profile";
import { useChatStore } from "../../store/useChatStore";

export default function TypingSVGLoader({ className = "" }) {
  const { selectedFriend } = useChatStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      className={`flex items-center gap-1 text-sm text-[#1f1f1f] p-3 px-4 ml-10 w-fit rounded-2xl bg-token-base-200 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <Profile user={selectedFriend} size={6} isActive={false} />
      </div>

      <span className="ml-1 font-semibold loader-clasic text-[14px]">Typing...</span>

    </motion.div>
  );
}
