import { Outlet } from "react-router-dom"
import { useState } from "react"
import SideNavigationBar from "../components/SideNavigationBar.jsx"
import HelpChatbot from "../components/HelpChatbot.jsx"

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#38b6ff] via-[#d6f1ff] to-[#ffffff]">
      {/* Sidebar */}
      <SideNavigationBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"} flex-grow p-6 overflow-y-auto`}
      >
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
          <Outlet />
        </div>
      </div>

      {/* Chatbot */}
      <HelpChatbot />
    </div>
  )
}

export default MainLayout
