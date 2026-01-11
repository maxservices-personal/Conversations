import React, { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { Edit, Upload, UserCircle } from 'lucide-react';

const SetUpPage = () => {
    const {authUser, updateProfile, logout} = useAuthStore();

    const [setUpData, setSetUpData] = useState({
        profilePic: authUser.profilePic,
        name: '',
        bio: '',
        phoneNumber: ''
    })

  return (
    <div className='w-full h-[90%]  flex justify-center items-center'>
        <div className="w-fit h-fit border border-token-border-medium rounded-2xl bg-token-base-200 p-5">
            <div className="text-[24px] ml-2 text-[#161616] font-semibold"><span className="text-[24px] font-normal text-[#555]">Getting started,</span> {authUser?.username}</div>
            <div className="mt-10 ml-2 flex items-center flex-col">
                <div className="w-[120px] object-cover flex items-center justify-center relative h-[120px] overflow-hidden border border-token-border-medium rounded-full bg-token-base-300">
                    {authUser?.profilePic ? (
                        <>
                            <img src={authUser.profilePic} className='object-cover w-full h-full' alt="" />
                            <button className='absolute bottom-4 right-4 bg-white p-1 rounded-full'>
                            <Edit size={20}/>
                        </button>
                        </>
                    ) : (
                        <div className="">
                            <button onClick={()=>logout()} className='p-1'>

                                <Upload size={34} />
                            </button>
                        </div>
                    )}
                    
                </div>
                <div className="">
                    <label className="block text-[#333333] font-medium mt-6 mb-2">Name</label>
                    <input value={setUpData.name} onChange={(e) => setSetUpData({...setUpData, name: e.target.value})} type="text" className="w-[450px] rounded-2xl px-4 py-2 border border-token-border-medium bg-token-base-100 focus:outline-none focus:ring-2 focus:ring-token-primary" placeholder='Name'/>
                </div>
                <div className="">
                    <label className="block text-[#333333] font-medium mt-6 mb-2">Bio</label>
                    <textarea value={setUpData.bio} onChange={(e) => setSetUpData({...setUpData, bio: e.target.value})} rows={4} className="w-[450px] resize-none px-4 py-2 border border-token-border-medium rounded-2xl bg-token-base-100 focus:outline-none focus:ring-2 focus:ring-token-primary" placeholder='Tell everyone about yourself'></textarea>
                </div>
                <div className="">
                    <label className="block text-[#333333] font-medium mt-6 mb-2">Phone Number(optional)</label>
                    <input value={setUpData.phoneNumber} onChange={(e) => setSetUpData({...setUpData, phoneNumber: e.target.value})} type="text" className="w-[450px] rounded-2xl px-4 py-2 border border-token-border-medium bg-token-base-100 focus:outline-none focus:ring-2 focus:ring-token-primary" placeholder='Phone Number'/>
                </div>
            </div>
            <div className='w-full justify-end mt-10 flex '>
                <button onClick={() => updateProfile(setUpData)} disabled={setUpData.name === '' || setUpData.bio === ''} className='p-2 px-4 border border-token-border-medium rounded-3xl bg-black hover:bg-[#000000cd] transition-colors disabled:bg-[#9f9f9f91] text-white '>Continue</button>
            </div>
        </div>

    </div>
  )
}

export default SetUpPage