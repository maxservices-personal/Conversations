import React from 'react'
import { useAuthStore } from '../../../../store/useAuthStore'

const GeneralTab = () => {
  const { logout } = useAuthStore()
  return (
    <div className=''>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default GeneralTab