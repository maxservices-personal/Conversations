import React, { useEffect } from 'react'
import { useParams } from "react-router-dom";
import Sidebar from '../Sidebar';
import { useUIStore } from '../../store/useUIStore';
import {easeInOut, motion } from "framer-motion"

const HandlePage = () => {
  const { selectedUserForHandlePage, setSelectedUserForHandlePage, isGettingUserDetails, userDetails, getUserDetails, setUserDetails } = useUIStore();

  useEffect(()=>{
    if (selectedUserForHandlePage) {
      getUserDetails(selectedUserForHandlePage)
    }
  }, [selectedUserForHandlePage])

  return (
    <div className='z-[200] bg-base-100 relative w-[calc(100%-70px)]'>
      <div className="w-full top-0 pt-4 left-0 flex items-start p-3 h-[150px] absolute gradient-blur ">
        <div className="flex items-center gap-2">
          <button onClick={()=>{setSelectedUserForHandlePage(null);
            setUserDetails(null);
          }} className='p-1 mb-[2px]'>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>
          </button>
          {userDetails && <motion.span 
            initial={{
                    opacity: 0,
                    x: -10,
                    width: 0,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    width: "fit-content",
                  }}
                  exit={{
                    opacity: 0,
                    x: 0,
                    width: 0,
                  }}
                  transition={{ duration: "0.5", ease: easeInOut }}
            className='font-bold text-nowrap text-text-primary text-2xl'>{userDetails.name}
            </motion.span>}
          <span className={`transition-all font-semibold duration-500 ${!userDetails ? "text-xl animate-pulse text-text-primary" : "text-sm mb-[-4px] text-text-secondary"}`}>@{selectedUserForHandlePage}</span>
        </div>
      </div>
    </div>
  )
}

export default HandlePage