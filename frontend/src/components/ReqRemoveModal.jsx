"use client"

import { motion } from "framer-motion"
import { useAuthContext } from "../hooks/useAuthContext"
import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import "../index.css"
import { getApiUrl } from "../api.js"

const API_URL = getApiUrl("/removals")

const ReqRemoveModal = ({ isOpen, onClose, onSubmit, removing }) => {
  const { user } = useAuthContext() // Fetch current user context
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState(null)

  const handleReasonChange = (e) => {
    setReason(e.target.value)
  }

  useEffect(() => {
    // Clear message after 3 seconds
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${API_URL}/remove-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add the Authorization header with your authentication token
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestingUser: `${user.firstname.trim()}`,
          removingUser: `${removing.firstname.trim()} ${removing.lastname.trim()}`,
          studentId: removing.studentId,
          reason: reason.trim(),
          organization: removing.organization,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit request.")
      }

      setMessage({ type: "success", text: "✅ Request sent!" })
      // Delay closing the modal to show the success message
      setTimeout(() => {
        onClose()
      }, 2000) // Close after 2 seconds
    } catch (error) {
      console.error("❌ Error submitting request:", error)
      setMessage({ type: "error", text: "❌ Failed to send request." })
    }
  }

  if (!isOpen) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-2">Kick User</h2>

          {message && (
            <div
              className={`p-3 mb-3 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="removal-box">
              <div className="flex items-center gap-2 -mb-1">
                <div className="name text-lg">
                  {removing.firstname} {removing.lastname}
                </div>

                <div className="remove-studid text-xs">{removing.studentId}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-[#941313]">
                  Requesting to remove from <i>{user.firstname}</i>.
                </div>

                <div className="text-xs">
                  {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
                </div>
              </div>

              <textarea
                value={reason}
                onChange={handleReasonChange}
                placeholder="Reason/s for removal..."
                className="w-full p-2 border border-gray-300 rounded mt-2"
                rows={4}
              />

              <div className="text-sm text-justify mb-5">
                The admins of {user.organization.name} have the right to assess the validity of this request. Kindly
                wait upon their decision on the removal.
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button type="submit" className="confirm-remove py-2 px-4 rounded">
                Send Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  )
}

ReqRemoveModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  removing: PropTypes.object.isRequired,
}

export default ReqRemoveModal

