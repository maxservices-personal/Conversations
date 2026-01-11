import React from 'react'
import { easeInOut, motion } from 'framer-motion'
import SingleTypeButton from '../../UIComponents/SingleTypeButton'
import { X } from 'lucide-react'
import { useUIStore } from '../../../store/useUIStore'

const AddMoment = () => { 
    const { setIsAddMoment } = useUIStore()
  return (
    <motion.div
    initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{ duration: 0.3, ease: easeInOut }}
      className='w-[calc(100%-320px)] h-full absolute right-0 top-0 bg-[#e7e7e73d] backdrop-blur-xl z-[200]'
      >
        <div className="flex items-center w-full px-3 py-2 justify-between">
            <span className='font-semibold text-[20px] gap-2 flex items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 960 960" fill="currentColor">
                <rect x="80" y="80" width="800" height="800" rx="160" ry="160" fill="transparent" stroke='currentColor' strokeWidth={40}/>

                <g transform="translate(210, 170) scale(0.63)">
                    <path d="m46 800 138-276q10-20 28.5-32t41.5-12q24 0 44 12.5t29 35.5l27 66q2 6 9 5.5t9-6.5l86-287q14-48 53.5-77t89.5-29q49 0 87.5 28.5T742 303l173 497h-85L666 328q-8-23-25-35.5T601 280q-23 0-40.5 13T535 329l-86 287q-9 28-32.5 46T363 680q-27 0-50-14.5T280 625l-27-66-118 241H46Zm194-400q-50 0-85-35.5T120 280q0-50 35-85t85-35q50 0 85 35t35 85q0 49-35 84.5T240 400Zm0-80q17 0 28.5-11.5T280 280q0-17-11.5-28.5T240 240q-17 0-28.5 11.5T200 280q0 17 11.5 28.5T240 320Z"/>
                </g>
                </svg>
                Add Moment
            </span>
            <SingleTypeButton OnChick={() => setIsAddMoment(false)}>
                <X />
            </SingleTypeButton>
        </div>
    </motion.div>
  )
}

export default AddMoment