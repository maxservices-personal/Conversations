import { GoogleLogin } from '@react-oauth/google';
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import { useAuthStore } from '../../store/useAuthStore';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn, googleLoginError, googleLoginSuccess } = useAuthStore();
  // const { setChats } = useChatStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
    // setChats([]);
  };

  return (
    <div className="h-screen flex items-center bg-[#ffffff] justify-center relative">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="flex justify-center gap-2 text-[#111111] mt-4 items-center">
         
          <svg
                xmlns="http://www.w3.org/2000/svg"
                height="50"
                viewBox="0 -960 960 960"
                width="50"
                fill="currentColor"
            >
                <path d="M554-120q-54 0-91-37t-37-89q0-76 61.5-137.5T641-460q-3-36-18-54.5T582-533q-30 0-65 25t-83 82q-78 93-114.5 121T241-277q-51 0-86-38t-35-92q0-54 23.5-110.5T223-653q19-26 28-44t9-29q0-7-2.5-10.5T250-740q-10 0-25 12.5T190-689l-70-71q32-39 65-59.5t65-20.5q46 0 78 32t32 80q0 29-15 64t-50 84q-38 54-56.5 95T220-413q0 17 5.5 26.5T241-377q10 0 17.5-5.5T286-409q13-14 31-34.5t44-50.5q63-75 114-107t107-32q67 0 110 45t49 123h99v100h-99q-8 112-58.5 178.5T554-120Zm2-100q32 0 54-36.5T640-358q-46 11-80 43.5T526-250q0 14 8 22t22 8Z" />
            </svg>
        </div>
      </div>
      <div className="flex flex-col z-10 justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-xl rounded-xl p-5 min-w-96 space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col text-[#111111] items-center gap-1 group">
              <h1 className="text-[34px] leading-7 font-bold mt-2 text-[#333333]">
                Welcome back
              </h1>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <div className="relative w-full mt-6">
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Email"
                  className="peer extra-input w-full px-3 pt-3 pb-3 text-[#313131] bg-white border-2 border-[#5858585e]  focus:border-[#9dd9d9] rounded-md focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="form-control text-[#252525]">
             
              <div className="relative">
                
                <input
                  type={showPassword ? "text" : "password"}
                  className={`peer extra-input w-full px-3 pt-3 pb-3 text-[#313131] bg-white border-2 border-[#5858585e]  focus:border-[#9dd9d9] rounded-md focus:outline-none focus:ring-0`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[#636363]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#636363]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#161616] border-2 border-[#5858585e] w-full px-3 py-3 rounded-lg disabled:bg-[#e4e4e4] text-[#fdfdfd]"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <hr className='border-[#5858585e]' />

          <div className="">
             <GoogleLogin
                useOneTap
                onSuccess={googleLoginSuccess}
                onFailure={googleLoginError}
                theme='filled_black'
                shape='circle'
                size='large'
              />
          </div>

          <div className="text-center">
            <p className="text-[#636363]">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link text-black">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern
      <AuthImagePattern
        title={"Welcome back!"}
        subtitle={"Sign in to continue your conversations and catch up with your messages."}
      /> */}
      {/* <div className="absolute bottom-0 left-0 w-full z-0">
        <div className="flex underline items-center justify-center text-black">
          Terms And Condition
        </div>
      </div> */}
    </div>
  );
};
export default LoginPage; 

