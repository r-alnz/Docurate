import { Outlet } from "react-router-dom"
import SideNavigationBar from "../components/SideNavigationBar.jsx"
import HelpChatbot from "../components/HelpChatbot.jsx"

const MainLayout = () => {
    return (
      <div className="flex h-screen bg-gradient-to-br from-[#38b6ff] via-[#d6f1ff] to-[#ffffff]">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 bg-white shadow-lg">
          <SideNavigationBar />
        </div>

        {/* Main Content */}
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
            <Outlet />
          </div>
        </div>

        {/* Chatbot */}
        <HelpChatbot />
      </div>
    );
}

export default MainLayout

