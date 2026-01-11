import React, { useEffect } from 'react'
import './assets/constants.css'
import HomePage from './pages/Other/HomePage'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoginPage from './pages/Auth/LoginPage'
import SignUpPage from './pages/Auth/SignUpPage'
import { useAuthStore } from './store/useAuthStore'
import { Loader2 } from 'lucide-react'
import SetUpPage from './pages/Other/SetUpPage'
import Navbar from './components/Navbar'
import { io } from "socket.io-client";
import { Toaster } from 'react-hot-toast'
import E2EEExplainer from './pages/Direct/ETEEPage'
import { useUIStore } from './store/useUIStore'
const socket = io("http://localhost:5001");

const App = () => {

    const location = useLocation();
    const isDirectPath = location.pathname.startsWith("/direct");

    if (isDirectPath) return <E2EEExplainer />;
    const { authUser, checkAuth, isCheckingAuth, getFriends, getFriendRequests } = useAuthStore();
    const { theme } = useUIStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(()=>{
    getFriends();
  }, [getFriends])

  useEffect(()=>{
    getFriendRequests()
  }, [getFriendRequests])


      

  console.log("Auth User:", authUser);

  if (isCheckingAuth) return (
    <div data-theme={theme} className="flex items-center justify-center bg-token-base-100 w-full h-screen text-[var(--token-text-secondary)]">
      <svg xmlns="http://www.w3.org/2000/svg"
          width="80" height="80" viewBox="0 -960 960 960"
          className="threads-loader" aria-hidden="true" role="img">
      <path d="M554-120q-54 0-91-37t-37-89q0-76 61.5-137.5T641-460q-3-36-18-54.5T582-533q-30 0-65 25t-83 82q-78 93-114.5 121T241-277q-51 0-86-38t-35-92q0-54 23.5-110.5T223-653q19-26 28-44t9-29q0-7-2.5-10.5T250-740q-10 0-25 12.5T190-689l-70-71q32-39 65-59.5t65-20.5q46 0 78 32t32 80q0 29-15 64t-50 84q-38 54-56.5 95T220-413q0 17 5.5 26.5T241-377q10 0 17.5-5.5T286-409q13-14 31-34.5t44-50.5q63-75 114-107t107-32q67 0 110 45t49 123h99v100h-99q-8 112-58.5 178.5T554-120Zm2-100q32 0 54-36.5T640-358q-46 11-80 43.5T526-250q0 14 8 22t22 8Z" />
      </svg>
    </div>
  )


  return (
    <div data-theme={theme} className='bg-token-base-100 w-full h-screen text-[var(--token-text-primary)]'>
      <Toaster />
      {authUser && !authUser?.isSetUp && <Navbar />}
      <Routes>
        <Route path="/" element={authUser ? authUser?.isSetUp ? <HomePage /> : <Navigate to={"/setup"} /> : <Navigate to={"/login"} />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
        <Route path="/setup" element={authUser && !authUser?.isSetUp ? <SetUpPage /> : <Navigate to={"/"} />} />
      </Routes>
    </div>
  )
}

export default App
