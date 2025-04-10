"use client"

import { useState, useEffect } from "react"
import { getToken } from "../utils/authUtil"
import { X, RotateCcw, Save, Clock, AlertTriangle } from "lucide-react"
import {
    getDocumentRevisions,
    getRevisionById,
    createDocumentRevision,
    deleteRevision,
} from "../services/documentRevisionService"

const RevisionHistoryPanel = ({ show, onClose, documentId, editorRef, currentPage, setPages, pages }) => {
    const [revisions, setRevisions] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [newRevisionName, setNewRevisionName] = useState("")
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [confirmDialog, setConfirmDialog] = useState({
        show: false,
        message: "",
        onConfirm: null,
        type: "",
    })

    // Load revisions when the panel is shown
    useEffect(() => {
        if (show && documentId) {
            loadRevisions()
        }
    }, [show, documentId])

    const loadRevisions = async () => {
        setLoading(true)
        setError(null)
        try {
            const token = getToken()
            const fetchedRevisions = await getDocumentRevisions(documentId, token)
            setRevisions(fetchedRevisions)
        } catch (err) {
            setError("Failed to load revision history. Please try again.")
            console.error("Error loading revisions:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateRevision = async () => {
        if (!editorRef.current) {
            setError("Editor not available. Please try again.")
            return
        }

        if (!newRevisionName.trim()) {
            setError("Please provide a name for this revision.")
            return
        }

        setLoading(true)
        setError(null)
        try {
            const token = getToken()

            // Instead of just getting the current editor content, combine all pages
            let combinedContent

            if (pages && Array.isArray(pages)) {
                // If pages array is available, use it to get all pages content
                combinedContent = pages.map((page) => page.content).join('<hr style="page-break-after: always;">')
            } else {
                // Fallback to just the current editor content if pages array is not available
                combinedContent = editorRef.current.getContent()
            }

            await createDocumentRevision(documentId, combinedContent, newRevisionName, token)
            setNewRevisionName("")
            setShowCreateForm(false)
            await loadRevisions() // Reload the revisions list
        } catch (err) {
            setError("Failed to create revision. Please try again.")
            console.error("Error creating revision:", err)
        } finally {
            setLoading(false)
        }
    }

    const showConfirmDialog = (message, onConfirm, type) => {
        setConfirmDialog({
            show: true,
            message,
            onConfirm,
            type,
        })
    }

    const hideConfirmDialog = () => {
        setConfirmDialog({
            show: false,
            message: "",
            onConfirm: null,
            type: "",
        })
    }

    const handleRestoreRevision = async (revisionId) => {
        if (!editorRef.current) {
            setError("Editor not available. Please try again.")
            return
        }

        showConfirmDialog(
            "Are you sure you want to restore this revision? This will replace your current document content.",
            async () => {
                try {
                    setLoading(true)
                    const token = getToken()
                    const revision = await getRevisionById(documentId, revisionId, token)

                    // Instead of directly setting the editor content, we need to handle multi-page documents
                    const revisionContent = revision.content

                    // Split the content by page breaks
                    const contentPages = revisionContent.split('<hr style="page-break-after: always;">')

                    // Create new pages array with the content
                    const newPages = contentPages.map((content, index) => ({
                        id: index + 1,
                        content,
                    }))

                    // Update all pages at once
                    if (setPages) {
                        setPages(newPages)
                    } else {
                        // Fallback to the old method if setPages is not available
                        editorRef.current.setContent(revision.content)
                    }

                    setLoading(false)
                    onClose() // Close the panel after restoration
                } catch (err) {
                    setError("Failed to restore revision. Please try again.")
                    console.error("Error restoring revision:", err)
                    setLoading(false)
                }
            },
            "restore",
        )
    }

    const handleDeleteRevision = async (revisionId) => {
        showConfirmDialog(
            "Are you sure you want to delete this revision? This action cannot be undone.",
            async () => {
                try {
                    setLoading(true)
                    const token = getToken()
                    await deleteRevision(documentId, revisionId, token)
                    await loadRevisions() // Reload the revisions list
                    setLoading(false)
                } catch (err) {
                    setError("Failed to delete revision. Please try again.")
                    console.error("Error deleting revision:", err)
                    setLoading(false)
                }
            },
            "delete",
        )
    }

    if (!show) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center">
                        <Clock className="mr-2" /> Revision History
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-grow">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                    {/* Custom Confirmation Dialog */}
                    {confirmDialog.show && (
                        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
                            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                                <div className="flex items-start mb-4">
                                    <AlertTriangle
                                        className={`mr-3 ${confirmDialog.type === "delete" ? "text-red-500" : "text-amber-500"}`}
                                    />
                                    <h3 className="text-lg font-medium">
                                        {confirmDialog.type === "delete" ? "Confirm Deletion" : "Confirm Restore"}
                                    </h3>
                                </div>
                                <p className="mb-6 text-gray-600">{confirmDialog.message}</p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={hideConfirmDialog}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            confirmDialog.onConfirm()
                                            hideConfirmDialog()
                                        }}
                                        className={`px-4 py-2 text-white rounded ${confirmDialog.type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                                            }`}
                                    >
                                        {confirmDialog.type === "delete" ? "Delete" : "Restore"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!showCreateForm ? (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="mb-4 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 flex items-center"
                        >
                            <Save className="mr-2 w-4 h-4" /> Save Current as Revision
                        </button>
                    ) : (
                        <div className="mb-4 p-4 border rounded">
                            <h3 className="font-medium mb-2">Create New Revision</h3>
                            <input
                                type="text"
                                value={newRevisionName}
                                onChange={(e) => setNewRevisionName(e.target.value)}
                                placeholder="Revision name (e.g. 'First draft', 'After client review')"
                                className="w-full border rounded p-2 mb-2"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="bg-gray-300 text-gray-700 py-1 px-3 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateRevision}
                                    className="bg-purple-600 text-white py-1 px-3 rounded hover:bg-purple-700"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Revision"}
                                </button>
                            </div>
                        </div>
                    )}

                    {loading && !revisions.length ? (
                        <div className="text-center py-8">Loading revision history...</div>
                    ) : revisions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No revision history found. Create your first revision to start tracking changes.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {revisions.map((revision, index) => (
                                <div key={revision._id} className="border rounded p-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">{revision.description || "Unnamed revision"}</h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(revision.createdAt).toLocaleString()}
                                                {index === 0 && <span className="ml-2 text-green-600 font-medium">(Latest)</span>}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {index > 0 && (
                                                <button
                                                    onClick={() => handleRestoreRevision(revision._id)}
                                                    className="bg-blue-100 text-blue-700 py-1 px-2 rounded hover:bg-blue-200 flex items-center text-sm"
                                                >
                                                    <RotateCcw className="w-3 h-3 mr-1" /> Restore
                                                </button>
                                            )}
                                            {index > 0 && (
                                                <button
                                                    onClick={() => handleDeleteRevision(revision._id)}
                                                    className="bg-red-100 text-red-700 py-1 px-2 rounded hover:bg-red-200 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RevisionHistoryPanel
