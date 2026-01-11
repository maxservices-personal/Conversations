import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../../store/useAuthStore";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const { signUp, isSigningUp, googleLoginError, googleLoginSuccess } = useAuthStore();
  // const { setChats } = useChatStore();

  const validateForm = () => {
    if (!formData.username.trim()) return toast.error("Username is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/^\S+@\S+\.\S+$/i.test(formData.email))
      return toast.error("Invaild email format");
    if (!formData.password.trim()) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 charecters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success) {
      signUp(formData);
      // setChats([]);
    }
  };

  return (
    <div className="h-screen flex items-center bg-[#ffffff] justify-center relative">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="flex justify-center gap-1 text-[#111111] mt-4 items-center">
          <svg
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 234 234"
            enable-background="new 0 0 234 234"
            xml:space="preserve"
            width="50"
            height="50"
          >
            <path
              fill="currentColor"
              opacity="1.000000"
              stroke="none"
              d="
M74.198792,175.198456 
    C69.715248,179.335007 65.802330,183.633682 61.257511,187.105087 
    C55.783337,191.286346 51.710918,190.790802 48.065521,186.538712 
    C44.611534,182.509888 45.204159,176.353821 49.449123,172.021805 
    C62.176102,159.033844 74.900826,146.043701 87.614487,133.042725 
    C88.048576,132.598816 88.354752,132.029816 89.092163,131.000320 
    C74.318214,131.000320 59.956844,131.072662 45.597046,130.954239 
    C41.525120,130.920654 37.376350,130.719727 33.410614,129.889542 
    C29.211172,129.010422 25.197493,123.236824 26.095993,119.744347 
    C27.418743,114.602814 30.443747,110.805130 36.415764,110.907570 
    C52.243164,111.179054 68.078300,110.999664 83.910355,110.999664 
    C85.522949,110.999664 87.135551,110.999664 90.132584,110.999664 
    C88.280357,108.977615 87.297874,107.821442 86.229263,106.751282 
    C74.336754,94.841545 62.395065,82.980629 50.551201,71.022789 
    C47.133301,67.572006 44.688770,63.866459 46.853897,58.445412 
    C49.342476,52.214470 56.580780,50.211056 61.399620,54.970184 
    C71.621902,65.065804 81.760208,75.246681 91.902237,85.423195 
    C95.672241,89.206017 99.356361,93.074432 103.961372,97.810669 
    C104.384109,93.562035 104.943596,90.470001 104.958176,87.375404 
    C105.042946,69.377258 104.993843,51.378502 105.002930,33.379955 
    C105.005981,27.341059 108.509003,23.161226 113.655930,22.999756 
    C119.616974,22.812740 123.953659,27.030195 123.974449,33.398422 
    C124.042961,54.388882 124.000252,75.379707 124.000252,97.079803 
    C125.394249,95.850388 126.460075,95.014175 127.406708,94.059746 
    C139.274902,82.093819 151.100067,70.085037 163.007629,58.158524 
    C164.900406,56.262741 166.921326,54.264294 169.273590,53.107746 
    C173.649750,50.956097 178.756912,52.376247 180.976089,55.782124 
    C184.128479,60.620266 183.652740,64.664574 179.168381,69.295532 
    C167.019653,81.841423 154.824219,94.342125 142.633636,106.847397 
    C141.507889,108.002205 140.284470,109.061768 138.216171,110.999664 
    C147.293198,110.999664 155.189850,110.999664 163.086517,110.999664 
    C174.085632,110.999664 185.084747,110.997185 196.083862,111.000603 
    C202.632690,111.002640 207.628845,115.094826 207.959534,120.716743 
    C208.256470,125.764488 203.428818,130.784439 197.027618,130.905548 
    C181.703674,131.195480 166.370529,130.999023 151.041107,130.998917 
    C147.167282,130.998901 143.293472,130.998917 138.970398,130.998917 
    C146.432907,138.937408 153.396103,146.490112 160.524048,153.884003 
    C166.892929,160.490540 173.572510,166.800232 179.867691,173.474167 
    C183.896500,177.745361 183.619858,182.915512 179.712372,186.775253 
    C175.983215,190.458832 170.351379,190.754791 166.397583,186.798798 
    C153.129669,173.523575 140.077667,160.032700 126.905319,146.661514 
    C126.283562,146.030380 125.299545,145.756119 124.000336,145.054260 
    C124.000336,160.877304 124.000336,176.266495 124.000336,191.655701 
    C124.000336,196.155334 124.000885,200.654984 124.000214,205.154617 
    C123.999146,212.274963 119.961296,217.851700 114.700615,217.999664 
    C108.781761,218.166153 104.155807,213.665314 104.126022,205.960297 
    C104.056526,187.990585 104.687965,170.018829 104.917969,152.046402 
    C104.946396,149.824799 104.260803,147.594070 103.763985,144.475662 
    C93.730949,154.935013 84.110214,164.964554 74.198792,175.198456 
z"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-col z-10 justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-xl rounded-xl p-5 min-w-96 space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col text-[#111111] items-center gap-1 group">
              <h1 className="text-[34px] leading-7 font-bold mt-2 text-[#333333]">
                Welcome 
              </h1>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <div className="relative w-full mt-6">
                <input
                  type="text"
                  id="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Username"
                  className="peer extra-input w-full px-3 pt-3 pb-3 text-[#313131] bg-white border-2 border-[#5858585e]  focus:border-[#9dd9d9] rounded-md focus:outline-none focus:ring-0"
                />
              </div>
            </div>
            <div className="form-control">
              <div className="relative w-full">
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
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
          <hr className="border-[#5858585e]" />
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
              Already have an account?{" "}
              <Link to={"/login"} className="link text-black">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
