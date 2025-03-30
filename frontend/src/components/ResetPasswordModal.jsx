"use client"

import PropTypes from "prop-types"
import { useState } from "react"
import { Eye, EyeOff, CheckCircle, AlertTriangle} from "lucide-react";
import { motion } from "framer-motion";
import { getToken } from "../utils/authUtil"

const ResetPasswordModal = ({ isOpen, user, onClose, onResetPassword }) => {
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [confirmPasswordError, setConfirmPasswordError] = useState("")
    const [modalState, setModalState] = useState("input") // 'input', 'confirm', or 'success'
    const token = getToken()

    // ✅ Password validation function
    const validatePassword = (value) => {
        setNewPassword(value)

        if (value.length < 8) {
            setPasswordError("Password must be at least 8 characters long")
        } else if (!/^(?=.*[A-Za-z])(?=.*[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(value)) {
            setPasswordError("Password must include at least one letter and one number or symbol")
        } else {
            setPasswordError("")
        }
    }

    const handleResetClick = () => {
        if (passwordError) return

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match")
            return
        }

        setConfirmPasswordError("")
        setModalState("confirm")
    }

    const handleConfirmReset = async () => {
        try {
            // Pass a third parameter 'false' to indicate not to show browser alert
            await onResetPassword(user.email, newPassword, token, false)
            setModalState("success")

            // Hide success message after 2 seconds and close modal
            setTimeout(() => {
                onClose()
            }, 2000)
        } catch (error) {
            console.error("Error resetting password:", error)
        }
    }

    const handleCancelConfirmation = () => {
        setModalState("input")
    }

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-4 w-96">
          {modalState === "input" && (
            <>
              <h2 className="text-lg font-semibold mb-4">
                Reset Password for {user.email}
              </h2>

              {/* New Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => validatePassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* ✅ Error message */}
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* ✅ Confirm Password Error */}
                {confirmPasswordError && (
                  <p className="text-red-500 text-sm mt-1">
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              {/* ✅ Show Password Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 transition flex items-center gap-2 w-[40px] justify-center ml-auto"
              >                  
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="bg-[#38b6ff] text-white px-4 py-2 rounded hover:bg-[#2a9ed6] transition"
                  onClick={handleResetClick}
                  disabled={passwordError || !newPassword || !confirmPassword}
                >
                  Reset Password
                </button>
              </div>
            </>
          )}

          {modalState === "confirm" && (
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
                  onClick={handleCancelConfirmation}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                  onClick={handleConfirmReset}
                >
                  Reset Password
                </button>
              </div>
            </motion.div>
          )}

          {modalState === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center py-6 flex flex-col items-center"
            >
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
            </motion.div>
          )}
        </div>
      </div>
    );
}

ResetPasswordModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onResetPassword: PropTypes.func.isRequired,
}

export default ResetPasswordModal

