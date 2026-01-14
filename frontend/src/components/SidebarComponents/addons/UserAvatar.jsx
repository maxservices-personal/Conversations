import React from 'react'

const UserAvatar = ({user}) => {
    if (!user.profilePic) return (
        <div className='w-14 h-14 flex items-center justify-center font-bold rounded-full overflow-hidden text-accent-300/50 border bg-accent-100/5 border-border-100/50'>
            <span>{user.name[0]}</span>
        </div>
    )

  return (
     <div className='w-14 h-14 rounded-full overflow-hidden border border-border-100/10'>
        <img src={user.profilePic} alt={user.name} className="rounded-full w-full h-full object-cover" />
    </div>
  )
}

export default UserAvatar