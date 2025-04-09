"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "../hooks/useAuthContext"
import { getDocumentsByUser, deleteDocument, recoverDocument, eraseDocument } from "../services/documentService"
import { useDocumentContext } from "../hooks/useDocumentContext"
import { getToken } from "../utils/authUtil"
import DeleteDocumentModal from "./DeleteDocumentModal"

const DocumentListContainer = () => {
  const { documents, loading, error, dispatch } = useDocumentContext()
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEraseModalOpen, setIsEraseModalOpen] = useState(false)
  const [isRecoverModalOpen, setIsRecoverModalOpen] = useState(false)
  const [documentToErase, setDocumentToErase] = useState(null)
  const [documentToRecover, setDocumentToRecover] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("name-asc")
  const [statusFilter, setStatusFilter] = useState("active")
  const [message, setMessage] = useState(null)

  const showMessage = (text, type = "success") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  useEffect(() => {
    const loadDocuments = async () => {
      dispatch({ type: "SET_LOADING", payload: true })
      try {
        const token = getToken()
        const fetchedDocuments = await getDocumentsByUser(user._id, token, statusFilter)
        dispatch({ type: "SET_DOCUMENTS", payload: fetchedDocuments })
      } catch (err) {
        console.error(err)
        dispatch({ type: "SET_ERROR", payload: "Failed to fetch documents. Please try again later." })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    if (user && user._id) {
      loadDocuments()
    }
  }, [dispatch, user, statusFilter])

  // Soft delete (archive) a document
  const handleDeleteDocument = async (documentId) => {
    try {
      const token = getToken()
      await deleteDocument(documentId, token)

      // If we're viewing active documents, remove this one from the current view
      if (statusFilter === "active") {
        dispatch({ type: "REMOVE_FROM_VIEW", payload: documentId })
      } else {
        // Otherwise just mark it as deleted in the state
        dispatch({ type: "DELETE_DOCUMENT", payload: documentId })
      }

      showMessage("Document inactivate successfully!")
    } catch (error) {
      console.error(error)
      showMessage("Failed to inactivate the document. Please try again.", "error")
    }
    setIsDeleteModalOpen(false)
  }

  // Recover a document
  // In your handleRecoverDocument function
  const handleRecoverDocument = async (documentId) => {
    try {
      const token = getToken()
      const response = await recoverDocument(documentId, token)

      // If we're viewing inactive documents, remove this one from the current view
      if (statusFilter === "inactive") {
        dispatch({ type: "REMOVE_FROM_VIEW", payload: documentId })
      } else {
        // Otherwise just update its status in the state
        dispatch({
          type: "RECOVER_DOCUMENT",
          payload: response.document || { _id: documentId, status: "active" },
        })
      }

      showMessage("Document recovered successfully!")
    } catch (error) {
      console.error(error)
      showMessage("Failed to recover the document. Please try again.", "error")
    }
    setIsRecoverModalOpen(false)
    setDocumentToRecover(null)
  }
  // Permanently delete a document
  const handleEraseDocument = async (documentId) => {
    try {
      const token = getToken()
      await eraseDocument(documentId, token)
      dispatch({ type: "ERASE_DOCUMENT", payload: documentId })
      showMessage("Document permanently deleted!")
    } catch (error) {
      console.error(error)
      showMessage("Failed to permanently delete the document. Please try again.", "error")
    }
    setIsEraseModalOpen(false)
    setDocumentToErase(null)
  }

  // Open delete modal
  const openDeleteModal = (document) => {
    setSelectedDocument(document)
    setIsDeleteModalOpen(true)
  }

  // Open recover modal
  const openRecoverModal = (document) => {
    setDocumentToRecover(document)
    setIsRecoverModalOpen(true)
  }

  // Open erase modal
  const openEraseModal = (document) => {
    setDocumentToErase(document)
    setIsEraseModalOpen(true)
  }

  // Filter documents by search query
  const filteredDocuments = documents.filter((document) =>
    document.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort documents based on selected option
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return a.title.localeCompare(b.title)
      case "name-desc":
        return b.title.localeCompare(a.title)
      case "date-asc":
        return new Date(a.createdAt) - new Date(b.createdAt)
      case "date-desc":
        return new Date(b.createdAt) - new Date(a.createdAt)
      default:
        return 0
    }
  })

  if (loading) return <p>Loading documents...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Documents</h2>

      {/* Search, Sort, and Filter */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search documents by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded w-full p-2 shadow"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border rounded p-2 shadow bg-white"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="date-asc">Date (Oldest First)</option>
          <option value="date-desc">Date (Newest First)</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2 shadow bg-white"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactivate</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Documents List */}
      {sortedDocuments.length === 0 ? (
        <p>No documents match your search criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedDocuments.map((document) => (
            <div
              key={document._id}
              className={`border rounded-lg p-6 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white max-w-sm mx-auto flex flex-col justify-between h-full ${document.status === "inactive" ? "opacity-50" : ""
                }`}
            >
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3 truncate">{document.title}</h3>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-900">Template:</strong> {document.template?.name || "N/A"}
                </p>
                {document.status === "inactive" && <p className="text-red-500 mb-2">Inactive</p>}
              </div>

              <div className="mt-auto flex gap-4">
                {document.status === "active" ? (
                  <>
                    <button
                      className="bg-[#38b6ff] text-white py-2 px-6 rounded-lg hover:bg-[#2a9ed6] transition-all duration-200 transform hover:scale-105"
                      onClick={() => navigate(`/documents/${document._id}`)}
                    >
                      Open
                    </button>
                    <button
                      className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
                      onClick={() => openDeleteModal(document)}
                    >
                      Inactive
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                      onClick={() => openRecoverModal(document)}
                    >
                      Recover
                    </button>
                    <button
                      className="bg-red-700 text-white py-2 px-6 rounded-lg hover:bg-red-900 transition-all duration-200 transform hover:scale-105"
                      onClick={() => openEraseModal(document)}
                    >
                      Erase
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete (Archive) Modal */}
      {isDeleteModalOpen && selectedDocument && (
        <DeleteDocumentModal
          isOpen={isDeleteModalOpen}
          documentTitle={selectedDocument.title}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={() => handleDeleteDocument(selectedDocument._id)}
          actionText="Archive"
          message="Are you sure you want to inactive this document? You can recover it later."
        />
      )}

      {/* Recover Modal */}
      {isRecoverModalOpen && documentToRecover && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">Recover Document</p>
            <p className="text-sm mt-1">Are you sure you want to recover "{documentToRecover.title}"?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setIsRecoverModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRecoverDocument(documentToRecover._id)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Recover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Erase Modal */}
      {isEraseModalOpen && documentToErase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">Permanently Delete Document</p>
            <p className="text-sm text-red-600 mt-1">
              This action cannot be undone. Are you sure you want to permanently delete "{documentToErase.title}"?
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setIsEraseModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEraseDocument(documentToErase._id)}
                className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Box */}
      {message && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    p-4 rounded shadow-lg text-white text-center w-80 z-50"
          style={{
            backgroundColor: message.type === "success" ? "#4CAF50" : message.type === "error" ? "#F44336" : "#FFC107",
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}

export default DocumentListContainer
