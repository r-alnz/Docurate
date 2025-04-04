import { NavLink } from "react-router-dom"
import { useAuthContext } from "../hooks/useAuthContext"
import { useLogout } from "../hooks/useLogout"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ic_system from "../assets/ic_sys.png"

const SideNavigationBar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuthContext()
  const { logout } = useLogout()

  const navItems = {
    superadmin: [
      { name: "Admins", path: "/admins" },
      { name: "Organizations", path: "/organizations" },
    ],
    admin: [
      { name: "Users", path: "/users" },
      { name: "Templates", path: "/templates" },
      { name: "Import Students", path: "/import" },
      { name: "Removal Requests", path: "/removalrequests" },
    ],
    organization: [
      { name: "Organization Officers", path: "/users" },
      { name: "Templates", path: "/user-templates" },
      { name: "Documents", path: "/documents" },
    ],
    student: [
      { name: "Templates", path: "/user-templates" },
      { name: "Documents", path: "/documents" },
    ],
  }

  const items = navItems[user?.role] || []

  const handleLogout = () => logout()

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-[#38B6FF] via-[#009FDA] to-[#38B6FF] text-white p-4 rounded-r-lg shadow-lg transition-transform duration-300 ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"
        }`}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute top-4 -right-5 z-10 bg-[#38B6FF] text-white rounded-full p-1 shadow-md`}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Top Section */}
        {isOpen && (
          <div className="flex items-start mb-6 bg-white bg-opacity-20 p-3 rounded-lg">
            <img
              src={ic_system || "/placeholder.svg"}
              alt="System Icon"
              className="w-10 h-10 mr-3 rounded-full bg-white p-1 flex-shrink-0"
            />
            <div>
              <p className="text-sm font-bold truncate">
                {user?.firstname} {user?.lastname}
              </p>
              <p className="text-xs opacity-80 truncate">
                {user?.organization ? `(${user.organization.name})` : ""}
              </p>
              <p className="text-xs opacity-80 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <ul className="space-y-2 overflow-y-auto flex-grow">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block p-2 rounded-lg transition-all duration-200 ${isActive
                    ? "bg-white text-[#38b6ff] shadow-md"
                    : "text-white hover:bg-white hover:bg-opacity-20"
                  }`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bottom Section */}
        {isOpen && (
          <div className="mt-auto">
            {/* Change Password */}
            <NavLink
              to="/change-password"
              className="block p-2 mt-4 text-center rounded-lg bg-yellow-500 hover:bg-yellow-600"
            >
              Change Password
            </NavLink>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="block w-full p-2 mt-2 text-center bg-red-500 hover:bg-red-600 rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SideNavigationBar
