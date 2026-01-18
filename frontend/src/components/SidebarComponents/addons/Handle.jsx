import React from 'react'
import { Link } from 'react-router-dom'
import { useUIStore } from '../../../store/useUIStore'

const Handle = ({handle, extra_className}) => {
  const { setSelectedUserForHandlePage } = useUIStore()
  return (
    <div onClick={()=>setSelectedUserForHandlePage(handle)} className={'no-underline text-text-secondary/80 text-sm hover:text-accent-100 font-semibold '+extra_className}>
        @{handle}
    </div>
  )
}

export default Handle