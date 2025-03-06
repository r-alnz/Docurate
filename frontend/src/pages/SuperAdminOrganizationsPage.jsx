import { useState, useEffect } from "react"
import OrganizationTable from "../components/OrganizationTable"
import AddOrganizationModal from "../components/AddOrganizationModal"
import { fetchOrganizations, addOrganization } from "../services/superAdminService"
import { useAuthContext } from "../hooks/useAuthContext"
import { useOrganizationContext } from "../hooks/useOrganizationContext.js"
import { Search, Building } from "lucide-react"

const SuperAdminOrganizationsPage = () => {
    const { token } = useAuthContext()
    const { organizations, dispatch } = useOrganizationContext()
    const [filteredOrganizations, setFilteredOrganizations] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddOrganizationModalOpen, setIsAddOrganizationModalOpen] = useState(false)

    useEffect(() => {
        if (organizations.length === 0) {
            const loadOrganizations = async () => {
                try {
                    const data = await fetchOrganizations(token)
                    dispatch({ type: "SET_ORGANIZATIONS", payload: data.organizations })
                } catch (error) {
                    console.error("Failed to fetch organizations:", error)
                }
            }

            loadOrganizations()
        }
    }, [token, dispatch, organizations.length])

    useEffect(() => {
        setFilteredOrganizations(organizations)
    }, [organizations])

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase()
        setSearchQuery(query)

        const filtered = organizations.filter((org) => org.name.toLowerCase().includes(query))
        setFilteredOrganizations(filtered)
    }

    const handleAddOrganization = async (organizationName) => {
        try {
            const newOrganization = await addOrganization(token, organizationName)
            dispatch({ type: "ADD_ORGANIZATION", payload: newOrganization.organization })
            setIsAddOrganizationModalOpen(false)
        } catch (error) {
            console.error("Failed to add organization:", error)
        }
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Manage Organizations
        </h1>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <button
              onClick={() => setIsAddOrganizationModalOpen(true)}
              className="flex items-center bg-[#38b6ff] text-white py-2 px-4 rounded-md hover:bg-[#2a9ed6] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#38b6ff] focus:ring-opacity-50"
            >
              <Building size={20} className="mr-2" />
              Add Organization
            </button>
          </div>

          <div className="overflow-x-auto">
            <OrganizationTable organizations={filteredOrganizations} />
          </div>
        </div>

        <AddOrganizationModal
          isOpen={isAddOrganizationModalOpen}
          onClose={() => setIsAddOrganizationModalOpen(false)}
          onSubmit={handleAddOrganization}
        />
      </div>
    );
}

export default SuperAdminOrganizationsPage

