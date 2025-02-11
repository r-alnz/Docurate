import { Outlet } from "react-router-dom"

const AuthLayout = () => {
    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-100 to-purple-100">
            {/* Left Side - Illustration or Branding */}
            <div className="w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-20"></div>
                <h1 className="text-6xl font-bold mb-4 relative z-10">DOCURATE</h1>
                <p className="text-xl relative z-10">Your Document Management Solution</p>
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-blue-700 to-transparent"></div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-1/2 flex items-center justify-center p-8 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300 to-pink-200 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200 to-green-100 rounded-tr-full"></div>
                <div className="w-full max-w-md bg-white bg-opacity-80 backdrop-blur-lg shadow-lg rounded-lg p-8 relative z-10">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AuthLayout

