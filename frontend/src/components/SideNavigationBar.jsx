import { NavLink } from "react-router-dom"
import { useAuthContext } from "../hooks/useAuthContext"
import { useLogout } from "../hooks/useLogout"
import ic_system from "../assets/ic_sys.png"

const SideNavigationBar = () => {
    const { user } = useAuthContext()
    const { logout } = useLogout()

    // Define navigation items based on roles
    const navItems = {
        superadmin: [
            { name: "Admins", path: "/admins" },
            { name: "Organizations", path: "/organizations" },
        ],
        admin: [
            { name: "Users", path: "/users" },
            { name: "Templates", path: "/templates" },
            { name: "Import Users", path: "/import" },
        ],
        organization: [
            { name: "Users (Organization)", path: "/users"},
            { name: "Templates", path: "/user-templates" },
            { name: "Documents", path: "/documents" },
        ],
        student: [
            { name: "Templates", path: "/user-templates" },
            { name: "Documents", path: "/documents" },
        ],
    }

    const items = navItems[user?.role] || []

    const handleLogout = () => {
        logout() // Perform logout
    }

    return (
        <nav className="flex flex-col h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 text-white p-4 rounded-r-lg shadow-lg">
            {/* Top Section: Icon and User Info */}
            <div className="flex items-start mb-6 bg-white bg-opacity-20 p-3 rounded-lg">
                <img
                    src={ic_system || "/placeholder.svg"}
                    alt="System Icon"
                    className="w-10 h-10 mr-3 rounded-full bg-white p-1 flex-shrink-0"
                />
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">
                        {user?.firstname} {user?.lastname}
                    </p>
                    <p className="text-xs opacity-80 truncate">
                        {user?.organization ? `(${user.organization.name})` : ""}
                    </p>
                    <p className="text-xs opacity-80 truncate">{user?.email}</p>
                </div>
            </div>

            {/* Navigation Items */}
            <ul className="mb-auto space-y-2 overflow-y-auto">
                {items.map((item) => (
                    <li key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `block p-2 rounded-lg transition-all duration-200 truncate ${isActive ? "bg-white text-blue-600 shadow-md" : "text-white hover:bg-white hover:bg-opacity-20"
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    </li>
                ))}
            </ul>

            {/* Change Password Link */}
            <NavLink
                to="/change-password"
                className={({ isActive }) =>
                    `block p-2 mb-2 text-center rounded-lg transition-all duration-200 truncate ${isActive ? "bg-white text-blue-600 shadow-md" : "bg-white bg-opacity-20 hover:bg-opacity-30"
                    }`
                }
            >
                Change Password
            </NavLink>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="block w-full p-2 text-center bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200"
            >
                Logout
            </button>
        </nav>
    )
}

export default SideNavigationBar

