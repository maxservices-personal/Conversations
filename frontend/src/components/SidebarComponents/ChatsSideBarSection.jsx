import React from 'react'
import { useAuthStore } from '../../store/useAuthStore';
import { Loader } from 'lucide-react';
import UserListItem from './addons/UserListItem';
import {Filters} from '../../lib/filters';
import Logo from './addons/Logo';

const ChatsSideBarSection = () => {
    const {
        activeUsers,
        friends,
        getFriends,
        isGettingFriends,
    } = useAuthStore();
        
    if (isGettingFriends) return <Loader className='animate-spin'></Loader>
    // <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M268-240 42-466l57-56 170 170 56 56-57 56Zm226 0L268-466l56-57 170 170 368-368 56 57-424 424Zm0-226-57-56 198-198 57 56-198 198Z"/></svg>
    // <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M280-420q25 0 42.5-17.5T340-480q0-25-17.5-42.5T280-540q-25 0-42.5 17.5T220-480q0 25 17.5 42.5T280-420Zm200 0q25 0 42.5-17.5T540-480q0-25-17.5-42.5T480-540q-25 0-42.5 17.5T420-480q0 25 17.5 42.5T480-420Zm200 0q25 0 42.5-17.5T740-480q0-25-17.5-42.5T680-540q-25 0-42.5 17.5T620-480q0 25 17.5 42.5T680-420ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
    // <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>

  return (
    <div className='flex flex-col gap-0 mt-2'>
        <div className="w-full mx-2">
            <div className="w-[95%] border border-border-100 bg-base-100 rounded-xl overflow-hidden flex items-center">
                <span className='p-2 text-text-secondary'>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
                </span>
                <input type="text" placeholder='Search friends, messages, etc.' className='w-[86.9%] bg-transparent placeholder:text-text-tertiary p-2 pl-0 pr-3 outline-none ' />
            </div>
        </div>
        <div className="flex items-center mt-3 ml-2 mb-3 gap-1">
            {Filters.map((filter, index)=>(
                <div className={`p-1 px-2 cursor-pointer hover:bg-accent-100/10 hover:text-accent-100 text-sm text-text-secondary border border-border-100 rounded-3xl ${filter.active ? "bg-accent-100/20 text-accent-100" : "bg-base-100"}`}>{filter.text}</div>
            ))}
        </div>
        {
            friends.length === 0 && (
        <div className='w-full h-[42vh] px-10 flex items-center justify-center flex-col gap-2'>
            <span className='text-text-secondary'><Logo width={32} height={32} /></span>
            <span className='text-text-secondary text-center text-sm font-semibold'>You have no friends added, start finding them!</span>
        </div>
        )}
        {friends.map((user, index)=><UserListItem index={index} user={user} />)}
    </div>
  )
}

export default ChatsSideBarSection