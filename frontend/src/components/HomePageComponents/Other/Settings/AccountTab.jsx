import React, { useState } from 'react'
import { useAuthStore } from '../../../../store/useAuthStore'
import { CheckCircle2Icon, CheckCircleIcon, User } from 'lucide-react';

const AccountTab = () => {
    const { authUser, logout } = useAuthStore();
    const [ isErrorInProfilePic, setIsErrorInProfilePic] = useState(false);
  return (
    <div className='flex items-center flex-col w-full h-full'>
            <div className="w-32 h-32 relative bg-token-base-200 rounded-full flex items-center justify-center border border-token-border-medium">

        {authUser.profilePic && !isErrorInProfilePic ? (
            <img onError={()=>setIsErrorInProfilePic(true)} src={authUser.profilePic} alt={authUser.name} className="rounded-full w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-[#555]">
              <User size={20} />
            </div>
        )}
        </div>
        
        <div className="mt-4 text-[24px] font-semibold flex items-center gap-1">{authUser.name} <div className="relative bottom-1 right-0  bg-token-secondary  backdrop-blur-lg text-token-secondary rounded-full">
            {authUser.plan === "varified" && (
  
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="9.5" stroke="#fff" stroke-width="1.8" stroke-dasharray="5" />
                
                <path d="M8.5 12.5L10.8 14.8L15.5 9.8" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
        )}

        </div>
        </div>
        <div className="mt-2 text-[16px] text-[#646464] font-semibold">{authUser.email}</div>
        <div className="mt-1 text-[14px] text-[#646464] font-semibold">@{authUser.username}</div>
    </div>
  )
}

export default AccountTab