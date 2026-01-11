import { User } from 'lucide-react'
import React from 'react'
import { useUIStore } from '../../store/useUIStore'

const Profile = ({ user, size, isActive }) => {
  const { theme } = useUIStore();

  return (
    <div className={`w-${size} h-${size} relative ${theme === "light" ? "bg-white border border-token-border-medium" : "bg-token-base-300 "} rounded-full flex items-center justify-center `}>
    {user.profilePic ? (
    <img src={user.profilePic} alt={user.username} className="rounded-full w-full h-full object-cover" />
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
  )
}

export default Profile