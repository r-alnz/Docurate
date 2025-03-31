import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { changePassword } from "../services/authService.js"
import {Eye, EyeOff, CheckCircle, AlertTriangle} from "lucide-react";
import {motion} from "framer-motion";
import { getToken } from "../utils/authUtil"
import { useAuthContext } from "../hooks/useAuthContext"

const ChangePasswordPage = () => {
  const { user } = useAuthContext()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [success, setSuccess] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const navigate = useNavigate()

  // Check if new password is same as current
  const isSameAsCurrentPassword = () => {
    return newPassword === currentPassword && currentPassword !== ""
  }

  // ✅ Password validation function
  const validatePassword = (value) => {
    setNewPassword(value)

    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return false
    } else if (!/^(?=.*[A-Za-z])(?=.*[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(value)) {
      setPasswordError("Password must include at least one letter and one number or symbol")
      return false
    } else if (value === currentPassword && currentPassword !== "") {
      setPasswordError("New password cannot be the same as your current password")
      return false
    } else {
      setPasswordError("")
      return true
    }
  }

  // Handle current password change
  const handleCurrentPasswordChange = (value) => {
    setCurrentPassword(value)
    // Re-validate new password when current password changes
    if (newPassword) {
      validatePassword(newPassword)
    }
  }

  // Validate confirm password
  const validateConfirmPassword = (value) => {
    setConfirmPassword(value)
    if (value !== newPassword) {
      setConfirmPasswordError("Passwords do not match")
      return false
    } else {
      setConfirmPasswordError("")
      return true
    }
  }

  // Handle form submission - show confirmation dialog
  const handleSubmit = async (e) => {
    e.preventDefault()
    setPasswordError("")
    setConfirmPasswordError("")
    setSuccess("")

    // Validate all fields again before submission
    if (!validatePassword(newPassword) || !validateConfirmPassword(confirmPassword)) {
      return
    }

    // Double-check that new password is not the same as current
    if (isSameAsCurrentPassword()) {
      setPasswordError("New password cannot be the same as your current password")
      return
    }

    // Show confirmation dialog instead of immediately changing password
    setShowConfirmDialog(true)
  }

  // Actual password change function - called after confirmation
  const confirmPasswordChange = async () => {
    try {
      const token = getToken()
      await changePassword(currentPassword, newPassword, token)

      // Close confirmation dialog
      setShowConfirmDialog(false)

      // Show success message and modal
      setSuccess("✅ Password changed successfully!")
      setShowSuccessModal(true)

      // Navigate after showing success message
      setTimeout(() => {
        setShowSuccessModal(false)
        navigate("/")
      }, 2000)
    } catch (err) {
      setShowConfirmDialog(false)
      setPasswordError(err.message || "Failed to change password")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Change Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ Success and Error Messages */}
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}
          {confirmPasswordError && (
            <p className="text-red-500 text-sm">{confirmPasswordError}</p>
          )}
          {success && !showSuccessModal && (
            <p className="text-green-500 text-sm">{success}</p>
          )}

          {/* Hidden Username/Email Field */}
          <input
            type="text"
            value={user?.email || ""}
            autoComplete="username"
            readOnly
            hidden
          />

          {/* Current Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Current Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => handleCurrentPasswordChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              autoComplete="current-password"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              New Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => validatePassword(e.target.value)}
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                isSameAsCurrentPassword() ? "border-red-500" : "border-gray-300"
              }`}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Same Password Warning */}
          {isSameAsCurrentPassword() && (
            <div className="p-2 bg-red-100 text-red-700 border border-red-400 rounded">
              ⚠️ Your new password must be different from your current password
            </div>
          )}

          {/* Confirm New Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirm New Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => validateConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              autoComplete="new-password"
            />
          </div>

          {/* ✅ Show Password Button */}
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-gray-500 hover:text-gray-700 transition flex items-center gap-2 w-[40px] justify-center ml-auto"
          >
            {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          {/* Change Password */}
          <button
            type="submit"
            className={`w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition ${
              passwordError ||
              confirmPasswordError ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              isSameAsCurrentPassword()
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={
              passwordError ||
              confirmPasswordError ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              isSameAsCurrentPassword()
            }
          >
            Change Password
          </button>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm mx-auto"
          >
            {/* ⚠️ Warning Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="flex justify-center mb-3"
            >
              <AlertTriangle className="text-yellow-500 w-14 h-14" />
            </motion.div>

            <h2 className="text-xl font-semibold text-gray-800">
              Confirm Password Reset
            </h2>
            <p className="text-gray-600 mt-2">
              This action cannot be undone. Are you sure you want to reset the
              password?
            </p>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-5">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                onClick={confirmPasswordChange}
              >
                Reset Password
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Success Message Modal */}
      {showSuccessModal && (
        <motion.div className="fixed inset-0 flex items-center z-50 justify-center backdrop-blur-md bg-black bg-opacity-50">
          <div className="text-center py-6 flex flex-col items-center bg-white p-6 rounded-lg shadow-lg">
            {/* ✅ Animated Check Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 10,
                delay: 0.2,
              }}
            >
              <CheckCircle className="text-green-600 w-14 h-14" />
            </motion.div>

            <h2 className="text-xl font-semibold text-green-600 mt-3">
              Success!
            </h2>
            <p className="text-gray-600 mt-1">Password reset successfully!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ChangePasswordPage

