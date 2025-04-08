// documentRevisionService.js
import axios from "axios"
import { getApiUrl } from "../api.js"

// Create a new document revision
const createDocumentRevision = async (documentId, content, description, token) => {
  try {
    const apiUrl = getApiUrl("")
    console.log("API URL:", apiUrl)

    const response = await axios.post(
      `${apiUrl}/documents/${documentId}/revisions`,
      { content, description },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return response.data
  } catch (error) {
    console.error("Error creating revision:", error)
    const errorMessage = error.response?.data?.message || "Error creating document revision"
    throw new Error(errorMessage)
  }
}

// Get all revisions for a document
const getDocumentRevisions = async (documentId, token) => {
  try {
    const apiUrl = getApiUrl("")
    console.log("API URL:", apiUrl)

    const response = await axios.get(`${apiUrl}/documents/${documentId}/revisions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching revisions:", error)
    throw new Error(error.response?.data?.message || "Error fetching document revisions")
  }
}

// Get a specific revision
const getRevisionById = async (documentId, revisionId, token) => {
  try {
    const apiUrl = getApiUrl("")
    console.log("API URL:", apiUrl)

    const response = await axios.get(`${apiUrl}/documents/${documentId}/revisions/${revisionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching revision:", error)
    throw new Error(error.response?.data?.message || "Error fetching revision")
  }
}

// Delete a specific revision
const deleteRevision = async (documentId, revisionId, token) => {
  try {
    const apiUrl = getApiUrl("")
    console.log("API URL:", apiUrl)

    const response = await axios.delete(`${apiUrl}/documents/${documentId}/revisions/${revisionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error deleting revision:", error)
    throw new Error(error.response?.data?.message || "Error deleting revision")
  }
}

export { createDocumentRevision, getDocumentRevisions, getRevisionById, deleteRevision }
