import { Outlet } from "react-router-dom"
import "../index.css"

const AuthLayout = () => {
    return (
      <div className="flex h-screen bg-gradient-to-br from-sky-100 to-blue-300">
        {/* Left Side - Illustration or Branding */}
        <div className="w-1/2 bg-gradient-to-br from-[#5ccfff] via-[#38b6ff] to-[#1e9ee0] text-white flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-20"></div>
          <img
            src="/assets/Docurate_Logo.png"
            alt="Docurate Logo"
            className="w-45 h-40 mb-4 relative z-10 rounded-full shadow-lg"
          />
          <h1 className="text-6xl font-bold mb-4 relative z-10">DOCURATE</h1>
          <p className="text-xl relative z-10">
            Your Document Management Solution
          </p>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-blue-700 to-transparent"></div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-1/2 flex items-center justify-center p-8 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#5ccfff] to-[#38b6ff] rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#76d4ff] to-[#c2e9ff] rounded-tr-full"></div>
          <div className="animated-bg w-full max-w-md backdrop-blur-lg shadow-lg p-3 pt-6 relative z-10 rounded-3xl">
            <Outlet />
          </div>
        </div>
      </div>
    );
}

export default AuthLayout

