"use client"
import { useAuthContext } from "../hooks/useAuthContext"
import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
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
  const [program, setProgram] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [message, setMessage] = useState(null)
  const today = new Date()
  // Birthdate restriction
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split("T")[0]
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Add a new state for the success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

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
    setShowConfirmDialog(true)
  }

  // Modify the handleConfirmSubmit function to show the success popup
  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false)

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
      program,
    }

    try {
      await onSubmit(userDetails) // Wait for submission

      // Show success popup with the correct message
      setSuccessMessage("Password reset successfully!")
      setShowSuccessPopup(true)

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
      setProgram("")

      // Close the success popup and modal after a delay
      setTimeout(() => {
        setShowSuccessPopup(false)
        onClose()
      }, 2000)
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
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="border rounded p-2 w-full"
                      required
                    />
                  </div>
                </>
              )}

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
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          {role === "student" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Password</label>
                <div className="flex items-center border rounded p-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => validatePassword(e.target.value)}
                    className="w-full outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 transition flex items-center"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Hint: Use <strong>lastname + student ID</strong>
                  <br />
                  Example: <i>DelaCruz21-02193</i>
                </p>
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>
            </>
          )}

          {role === "organization" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Password</label>
                <div className="flex items-center border rounded p-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => validatePassword(e.target.value)}
                    className="w-full outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 transition flex items-center"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Hint: Use <strong>organization name + @</strong>
                  <br />
                  Example: <i>organizationname@</i>
                </p>
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>
            </>
          )}

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
                                  ? "bg-[#38b6ff] text-white"
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
            <button type="submit" className="bg-[#38b6ff] text-white py-2 px-4 rounded hover:bg-[#2a9ed6]">
              Add User
            </button>
          </div>
        </form>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
              <div className="flex items-start mb-4">
                <div className="mr-3 bg-blue-100 p-2 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Confirm Changes</h3>
                  <p className="text-gray-600 mt-1">
                    Are you sure you want to save these changes? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="bg-[#38b6ff] text-white py-2 px-4 rounded hover:bg-[#2a9ed6]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-green-600 mb-2">Success!</h3>
              <p className="text-gray-600">Password reset successfully!</p>
            </div>
          </div>
        )}
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

