import React, { useState } from 'react'

const UserAvatar = ({user, extra_class}) => {
    const [isError, setIsError] = useState(false); 

    if (!user.profilePic) return (
        <div className={'w-14 h-14 flex items-center justify-center font-bold rounded-full overflow-hidden text-accent-300/50 border bg-accent-100/5 border-border-100/50 ' + extra_class}>
            <span>{user.name[0]}</span>
        </div>
    )

  return (
     <div className={'w-14 h-14 flex items-center justify-center font-bold rounded-full text-accent-300/50 border bg-accent-100/5 border-border-100/50 overflow-hidden ' + extra_class}>
        {
          isError ? (
            <span>{user.name[0]}</span>
          ) : (
            <img onError={()=>setIsError(true)} src={user.profilePic} alt={user.name} className="rounded-full w-full h-full object-cover" />
          )
        }
    </div>
  )
}

export default UserAvatar