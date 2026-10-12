import React, { useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import ChatScreen from "../../components/HomePageComponents/ChatScreen";
import { useChatStore } from "../../store/useChatStore";
import ChatNotSelected from "../../components/HomePageComponents/ChatNotSelected";
import { useMessageStore } from "../../store/useMessagestore";
import { socket } from "../../lib/socket";
import notificationSound from "../../assets/Audio/notification-sound.mp3";
import { useUIStore } from "../../store/useUIStore";
import Settings from "../../components/HomePageComponents/Other/Settings";
import { AnimatePresence } from "framer-motion";
import StandBy from "./StandBy";
import AddMoment from "../../components/HomePageComponents/Other/AddMoment";
import ExploreSection from "./ExploreSection";
import HandlePage from "../../components/SidebarComponents/HandleSection";

const HomePage = () => {
  const { selectedFriend } = useChatStore();
  const { isSettingsOpen, isOnStandBy, isAddMoment, isExploreTab, selectedUserForHandlePage} = useUIStore();
  const audioRef = useRef(null);
  const playSound = () => {
    audioRef.current.play();
  };

  
  return (
    <div className="flex w-full h-full text-text-primary font-inter overflow-x-hidden bg-base-100">
      {/* <div className="absolute fade-in-normal-animate opacity-50 bg-contain  top-0 left-0 bg-[url(/1000063412.png)] blur-3xl w-full h-full z-[1]"></div> */}
      <Sidebar />
      {
        selectedUserForHandlePage ? <HandlePage /> : selectedFriend&&!isExploreTab ? <ChatScreen playSound={playSound} /> : isOnStandBy ? <StandBy /> : isExploreTab ? <ExploreSection /> : <ChatNotSelected />
      }
      {}
      <audio ref={audioRef} src={notificationSound} className="hidden" />
      <AnimatePresence mode="wait">
        {isAddMoment && <AddMoment />}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {isSettingsOpen && <Settings />}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
