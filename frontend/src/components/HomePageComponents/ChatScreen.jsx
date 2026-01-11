import React from 'react'
import ChatHeader from './ChatHeader'
import ChatContainer from './ChatContainer'

const ChatScreen = ({ playSound }) => {
  return (
    <div className='w-full md:w-[calc(100%-320px)] z-[2] relative h-full'>
      <ChatHeader />
      <ChatContainer playSound={playSound} />
    </div>
  )
}

export default ChatScreen