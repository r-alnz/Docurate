"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { fetchOrganizations } from "../services/superAdminService"
import { useAuthContext } from "../hooks/useAuthContext"
import { useOrganizationContext } from "../hooks/useOrganizationContext"
import { Eye, EyeOff } from "lucide-react"

const AddAdminModal = ({ isOpen, onClose, onSubmit }) => {
  const { token } = useAuthContext()
  const { organizations: contextOrganizations, dispatch } = useOrganizationContext()

  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [role, setRole] = useState("admin") // Default role is admin
  const [organization, setOrganization] = useState("")
  const [loading, setLoading] = useState(false)
  const [organizations, setOrganizations] = useState([])
  const [position, setPosition] = useState("")
  const [customPosition, setCustomPosition] = useState("") // New state for 'Other' input
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const today = new Date()
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split("T")[0]

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[A-Za-z\s]+$/
    return nameRegex.test(name)
  }

  const handlePositionChange = (e) => {
    const selectedPosition = e.target.value
    setPosition(selectedPosition) // Update position with the selected dropdown option

    // If 'Other' is selected, allow the user to type a custom position
    if (selectedPosition !== "Other") {
      setCustomPosition("") // Clear custom position if it's no longer 'Other'
    }
  }

  const handleCustomPositionChange = (e) => {
    const customValue = e.target.value
    setCustomPosition(customValue) // Only update the customPosition state
    // Don't update position here, as it should remain "Other"
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateAge = (birthdate) => {
    if (!birthdate) return true // Optional field
    const birthDate = new Date(birthdate)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18
    }

    return age >= 18
  }

  useEffect(() => {
    const loadOrganizations = async () => {
      if (contextOrganizations.length > 0) {
        setOrganizations(contextOrganizations)
        return
      }

      setLoading(true)
      try {
        const data = await fetchOrganizations(token)
        setOrganizations(data.organizations)
        dispatch({ type: "SET_ORGANIZATIONS", payload: data.organizations })
      } catch (error) {
        console.error("Failed to fetch organizations:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadOrganizations()
    }
  }, [token, isOpen, contextOrganizations, dispatch])

  useEffect(() => {
    if (message && !showMessageModal) {
      const timer = setTimeout(() => setMessage(null), 3000) // Clear message after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [message, showMessageModal])

  // Effect to handle closing the modal after showing success message
  useEffect(() => {
    if (showMessageModal) {
      const timer = setTimeout(() => {
        setShowMessageModal(false)
        onClose()
      }, 1500) // Slightly longer delay to ensure message is visible
      return () => clearTimeout(timer)
    }
  }, [showMessageModal, onClose])

  const validatePassword = (value) => {
    setPassword(value)

    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
    } else if (!/^(?=.*[A-Za-z])(?=.*[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(value)) {
      setPasswordError("Password must include at least one letter and one number or symbol")
    } else {
      setPasswordError("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form data
    if (!validateName(firstname)) {
      setMessage({ type: "error", text: "❌ First name should contain only letters" })
      return
    }

    if (!validateName(lastname)) {
      setMessage({ type: "error", text: "❌ Last name should contain only letters" })
      return
    }

    if (!validateEmail(email)) {
      setMessage({ type: "error", text: "❌ Please enter a valid email address with @ symbol" })
      return
    }

    if (!validateAge(birthdate)) {
      setMessage({ type: "error", text: "❌ User must be at least 18 years old" })
      return
    }

    if (passwordError) {
      setMessage({ type: "error", text: "❌ Please fix the password issues before submitting" })
      return
    }

    // Show confirmation modal instead of submitting
    setShowConfirmationModal(true)
  }

  const handleConfirmSubmit = async () => {
    // Use customPosition value when "Other" is selected
    const finalPosition = position === "Other" ? customPosition : position

    const userDetails = { firstname, lastname, email, birthdate, password, role, organization, position: finalPosition }

    try {
      await onSubmit(userDetails)

      // Reset form fields
      setFirstname("")
      setLastname("")
      setEmail("")
      setBirthdate("")
      setPassword("")
      setPasswordError("")
      setRole("admin")
      setOrganization("")
      setPosition("")

      // Close confirmation modal
      setShowConfirmationModal(false)

      // Show success message modal
      setMessage({ type: "success", text: "✅ Submission successful!" })
      setShowMessageModal(true)

      // The modal will close automatically due to the useEffect above
    } catch (error) {
      console.error("❌ Submission failed:", error)
      setMessage({ type: "error", text: "❌ Submission failed. Please try again." })
      setShowConfirmationModal(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 md:p-6 rounded shadow-lg max-w-lg w-full h-auto max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Admin</h2>
        <form onSubmit={handleSubmit}>
          {/* Organization */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Organization</label>
            {loading ? (
              <p>Loading organizations...</p>
            ) : (
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="border rounded p-2 w-full"
                required
              >
                <option value="">Select an organization</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Position */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Position</label>
            <select
              value={position} // Bind position state to the dropdown
              onChange={handlePositionChange} // Handle dropdown change
              className="border rounded p-2 w-full"
            >
              <option value="">Select a position</option>
              <option value="University Admin">University Admin</option>
              <option value="Staff">Staff</option>
              <option value="SASO">SASO</option>
              <option value="Professor">Professor</option>
              <option value="Other">Other</option> {/* 'Other' option */}
            </select>

            {/* If 'Other' is selected, show a text input for custom position */}
            {position === "Other" && (
              <input
                type="text"
                value={customPosition} // Use customPosition state for 'Other'
                onChange={handleCustomPositionChange} // Update customPosition on input change
                className="border rounded p-2 w-full mt-2"
                placeholder="Please specify"
              />
            )}
          </div>

          {/* First Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">First Name</label>
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Last Name</label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          {/* Birthdate */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Birthdate</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="border rounded p-2 w-full"
              required
              max={maxDate} // Restrict to at least 18 years old
            />
          </div>

          {/* Separator with Icon */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-600 font-medium text-sm flex items-center">
              <svg
                className="w-5 h-5 text-gray-500 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m4-4v8"></path>
              </svg>
              Account Information
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-700 transition flex items-center gap-2 w-[40px] justify-center ml-auto"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <p className="text-gray-500 text-sm mt-1">
              Hint: Use <strong>last name + Bithdate year</strong>
              <br />
              Example: <i>delacruz2000</i>
            </p>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          {/* Inline Message - Moved below password section */}
          {message && !showMessageModal && (
            <div
              className={`mb-4 p-2 rounded ${message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-400"
                : "bg-red-100 text-red-700 border border-red-400"
                }`}
            >
              {message.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#38b6ff] text-white px-4 py-2 rounded hover:bg-[#2a9ed6] transition"
              disabled={loading}
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Success Message Modal - Completely separate from the main modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <p className="text-green-700 text-center font-medium text-lg">✅ Submission successful!</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirm Details</h3>

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <p className="font-medium">Organization:</p>
                <p>{organizations.find((org) => org._id === organization)?.name || "Not selected"}</p>

                <p className="font-medium">Position:</p>
                <p>{position === "Other" ? customPosition : position}</p>

                <p className="font-medium">Name:</p>
                <p>
                  {firstname} {lastname}
                </p>

                <p className="font-medium">Email:</p>
                <p>{email}</p>

                <p className="font-medium">Birthdate:</p>
                <p>{birthdate}</p>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="bg-[#38b6ff] text-white px-4 py-2 rounded hover:bg-[#2a9ed6] transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

AddAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default AddAdminModal
