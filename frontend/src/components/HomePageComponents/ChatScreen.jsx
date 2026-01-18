import React from 'react'
import ChatHeader from './ChatHeader'
import ChatContainer from './ChatContainer'
import { useUIStore } from '../../store/useUIStore';

const ChatScreen = ({ playSound }) => {
      const { isSidebarMinimized, toggleIsSidebarMinimized } = useUIStore();
  
  return (
    <div className={`w-full border-l border-token-border-medium z-[2] transition-all duration-700 relative h-full ${isSidebarMinimized ? "md:w-[calc(100%-70px)]" : "md:w-[calc(100%-320px)]"}`}>
      <ChatHeader />
      <ChatContainer playSound={playSound} />
    </div>
  )
}

export default ChatScreen