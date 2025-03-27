"use client"

import PropTypes from "prop-types"
import { useState } from "react"
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
                        <h2 className="text-lg font-semibold mb-4">Reset Password for {user.email}</h2>

                        {/* New Password */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">New Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => validatePassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {/* ✅ Error message */}
                            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {/* ✅ Confirm Password Error */}
                            {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
                        </div>

                        {/* ✅ Show Password Button */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="bg-[#38b6ff] text-white py-2 px-4 rounded hover:bg-[#2a9ed6] transition"
                        >
                            {showPassword ? "🙈 Hide Password" : "👁️ Show Password"}
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
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                                onClick={handleResetClick}
                                disabled={passwordError || !newPassword || !confirmPassword}
                            >
                                Reset Password
                            </button>
                        </div>
                    </>
                )}

                {modalState === "confirm" && (
                    <>
                        <h2 className="text-lg font-semibold mb-4">Confirm Password Reset</h2>
                        <p className="mb-4">Are you sure you want to reset the password of this user?</p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                                onClick={handleCancelConfirmation}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                                onClick={handleConfirmReset}
                            >
                                OK
                            </button>
                        </div>
                    </>
                )}

                {modalState === "success" && (
                    <div className="text-center py-4">
                        <h2 className="text-lg font-semibold text-green-600 mb-2">Success!</h2>
                        <p>Password reset successfully!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

ResetPasswordModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onResetPassword: PropTypes.func.isRequired,
}

export default ResetPasswordModal

