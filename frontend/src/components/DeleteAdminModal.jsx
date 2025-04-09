"use client"

import PropTypes from "prop-types"
import { X, Trash2, AlertTriangle } from "lucide-react"
import { useState } from "react"

const DeleteAdminModal = ({ isOpen, user, onClose, onDelete }) => {
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(user._id)
      onClose()
    } catch (error) {
      console.error("Error deleting user:", error)
      setIsDeleting(false)
    }
  }

  const isConfirmationValid = confirmText.toLowerCase() === "delete"

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Delete User</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertTriangle size={20} />
            <span className="font-semibold">Warning</span>
          </div>
          <p className="text-sm text-gray-700">
            You are about to permanently delete{" "}
            <strong>
              {user.firstname} {user.lastname}
            </strong>
            . This action cannot be undone.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type <strong>DELETE</strong> to confirm:
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-300"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-400 transition duration-200 ease-in-out focus:ring-2 focus:ring-gray-300 flex items-center gap-2"
            onClick={onClose}
            disabled={isDeleting}
          >
            <X size={16} />
            <span>Cancel</span>
          </button>

          <button
            className={`px-4 py-2 rounded-lg shadow-md transition duration-200 ease-in-out focus:ring-2 focus:ring-red-300 flex items-center gap-2 ${isConfirmationValid && !isDeleting
                ? "bg-red-500 text-white hover:bg-red-700"
                : "bg-red-300 text-white cursor-not-allowed"
              }`}
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
          >
            <Trash2 size={16} />
            <span>{isDeleting ? "Deleting..." : "Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

DeleteAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default DeleteAdminModal
