import axios from "axios"
import { useAuthContext } from "../hooks/useAuthContext"
import { useState, useEffect } from "react"
import PropTypes from "prop-types"

const AddUserModal = ({ isOpen, onClose, onSubmit, suborganizations, suborgAlready }) => {
  const { user } = useAuthContext() // Fetch current user context
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student") // Default role
  const [studentId, setStudentId] = useState("")
  // const [isStudentOrgMember, setIsStudentOrgMember] = useState(false);
  const [isStudentOrgMember, setIsStudentOrgMember] = useState(true)
  const [selectedSubOrgs, setSelectedSubOrgs] = useState([])
  const [college, setCollege] = useState("")
  const [course, setCourse] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [message, setMessage] = useState(null)
  const today = new Date()
  // Birthdate restriction
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split("T")[0]

  // Password validation
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

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[A-Za-z\s]+$/
    return nameRegex.test(name)
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateCollege = (college) => {
    const collegeRegex = /^[A-Za-z\s]+$/
    return collegeRegex.test(college)
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
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000) // Clear message after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [message])

  const currRole = suborgAlready.length > 0 ? suborgAlready[0].role : null

  console.log("Props received in AddUserModal:", { suborgAlready, suborganizations, currRole })

  useEffect(() => {
    if (currRole === "organization") {
      setSelectedSubOrgs(suborgAlready.map((org) => org._id))
      console.log("Auto-selecting suborg: ", suborgAlready)
    }
  }, [currRole, suborgAlready])

  // Fetch sub-organizations when modal opens

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form data
    if (firstname && !validateName(firstname)) {
      setMessage({ type: "error", text: "❌ First name should contain only letters" })
      return
    }

    if (lastname && !validateName(lastname)) {
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

    // Validate college name if role is student
    if (role === "student" && college && !validateCollege(college)) {
      setMessage({ type: "error", text: "❌ College name should contain only letters" })
      return
    }

    if (passwordError) {
      setMessage({ type: "error", text: "❌ Please fix the password issues before submitting" })
      return
    }

    console.log("Submitting with suborganizations:", selectedSubOrgs)

    const userDetails = {
      firstname: firstname.trim() === "" ? null : firstname,
      lastname: lastname.trim() === "" ? " " : lastname,
      email,
      password,
      role,
      ...(role === "student" && { studentId }),
      ...(role === "student" && { birthdate }),
      organization: user.organization._id,
      organizationName: user.organization.name,
      suborganizations: isStudentOrgMember ? [...selectedSubOrgs] : [],
      college,
      course,
    }

    try {
      await onSubmit(userDetails) // Wait for submission

      // Show success message modal
      setMessage({ type: "success", text: "✅ Submission successful!" })

      // Reset form fields
      setFirstname("")
      setLastname("")
      setEmail("")
      setPassword("")
      setRole("student")
      setStudentId("")
      setIsStudentOrgMember(false)
      setSelectedSubOrgs([])
      setBirthdate("")
      setCollege("")
      setCourse("")

      // Close the modal after showing success message
      setTimeout(() => {
        setMessage(null)
        onClose()
      }, 1000)
    } catch (error) {
      console.error("❌ Submission failed:", error)
      setMessage({ type: "error", text: "❌ Submission failed. Please try again." })
    }
  }

  if (!isOpen) return null

  console.log("Suborganizations Type:", typeof suborganizations, suborganizations)
  suborganizations.forEach((org, index) => {
    console.log(`Index ${index}:`, org)
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add User</h2>
        <form onSubmit={handleSubmit}>
          {role === "student" ? (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="border rounded p-2 w-full">
                  <option value="student">Student</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
              {role === "student" && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Student ID</label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="border rounded p-2 w-full"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">College</label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="border rounded p-2 w-full"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Program</label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="border rounded p-2 w-full"
                      required
                    />
                  </div>
                </>
              )}
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
            </>
          ) : role === "organization" ? (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Organization Name</label>
              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="border rounded p-2 w-full"
                required
              />
            </div>
          ) : null}

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
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <div className="flex flex-col">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => validatePassword(e.target.value)}
                className="border rounded-t p-2 w-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="bg-gray-200 border-t border-gray-300 text-gray-700 p-2 rounded-b hover:bg-gray-300"
              >
                {showPassword ? "🙈 Hide Password" : "👁️ Show Password"}
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          {/* Replace the existing message display with this */}
          {/* Message Modal */}
          {message && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                <p className={`mb-4 ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          {/* Inline message display */}
          {message && (
            <div
              className={`mt-4 p-2 rounded ${message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-400"
                : "bg-red-100 text-red-700 border border-red-400"
                }`}
            >
              {message.text}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Organization</label>
            <p className="text-gray-700">{user.organization?.name || "N/A"}</p>
          </div>

          {currRole === "organization" ? (
            <>
              <label className="block text-gray-700 font-medium mb-2">Suborganization</label>
              <p className="text-gray-700">{suborgAlready.map((org) => org.firstname)}</p>
            </>
          ) : currRole === "admin" ? (
            <>
              {role === "student" && (
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isStudentOrgMember}
                      onChange={() => setIsStudentOrgMember(!isStudentOrgMember)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 font-medium">
                      Part of a suborganization (e.g., Student Organization)?
                    </span>
                  </label>

                  {isStudentOrgMember && (
                    <div className="mb-4">
                      {suborganizations.length === 0 ? (
                        <div className="border rounded p-2 w-full text-gray-500">
                          No suborganizations under {user.organization?.name}
                        </div>
                      ) : (
                        <div className="border rounded p-2 w-full h-32 overflow-y-auto">
                          {suborganizations.map((org) => (
                            <div
                              key={org._id}
                              onClick={() => {
                                setSelectedSubOrgs(
                                  (prev) =>
                                    prev.includes(org._id)
                                      ? prev.filter((id) => id !== org._id) // Remove if already selected
                                      : [...prev, org._id], // Add if not selected
                                )
                              }}
                              className={`p-2 cursor-pointer ${selectedSubOrgs.includes(org._id)
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700"
                                } rounded mb-1`}
                            >
                              {org.firstname || "(No Name)"}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

AddUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default AddUserModal

