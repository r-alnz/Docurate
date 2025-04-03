import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { getDocumentsByUser, deleteDocument } from '../services/documentService';
import { useDocumentContext } from '../hooks/useDocumentContext';
import { getToken } from '../utils/authUtil';
import DeleteDocumentModal from './DeleteDocumentModal'; // Import the modal

const DocumentListContainer = () => {
    const { documents, loading, error, dispatch } = useDocumentContext();
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const [selectedDocument, setSelectedDocument] = useState(null); // Track the selected document for deletion
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // Search query state
    const [sortOption, setSortOption] = useState('name-asc'); // Sort option state
    const [message, setMessage] = useState(null);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000); // Auto-hide after 3 seconds
    };

    useEffect(() => {
        const loadDocuments = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const token = getToken();
                const fetchedDocuments = await getDocumentsByUser(user._id, token);
                dispatch({ type: 'SET_DOCUMENTS', payload: fetchedDocuments });
            } catch (err) {
                console.error(err);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch documents. Please try again later.' });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        loadDocuments();
    }, [dispatch, user]);

    const handleDeleteDocument = async (documentId) => {
        try {
            const token = getToken();
            await deleteDocument(documentId, token);
            dispatch({ type: 'DELETE_DOCUMENT', payload: documentId });
            showMessage('Document deleted successfully!');
        } catch (error) {
            console.error(error);
            showMessage('Failed to delete the document. Please try again.');
        }
    };

    const openDeleteModal = (document) => {
        setSelectedDocument(document);
        setIsModalOpen(true);
    };

    // Filter documents by search query
    const filteredDocuments = documents.filter((document) =>
        document.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort documents based on selected option
    const sortedDocuments = [...filteredDocuments].sort((a, b) => {
        switch (sortOption) {
            case 'name-asc':
                return a.title.localeCompare(b.title);
            case 'name-desc':
                return b.title.localeCompare(a.title);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0;
        }
    });

    if (loading) return <p>Loading documents...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Your Documents</h2>

        {/* Search and Sort */}
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
        </div>

        {/* Documents List */}
        {sortedDocuments.length === 0 ? (
          <p>No documents match your search criteria.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDocuments.map((document) => (
              <div
                key={document._id}
                className="border rounded-lg p-6 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white max-w-sm mx-auto flex flex-col justify-between h-full"
              >
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3 truncate">
                    {document.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    <strong className="text-gray-900">Template:</strong>{" "}
                    {document.template?.name || "N/A"}
                  </p>
                </div>

                <div className="mt-auto flex gap-4">
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
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        {isModalOpen && selectedDocument && (
          <DeleteDocumentModal
            isOpen={isModalOpen}
            documentTitle={selectedDocument.title}
            onClose={() => setIsModalOpen(false)}
            onDelete={() => handleDeleteDocument(selectedDocument._id)}
          />
        )}

        {/* Mini Message Box (Centered) */}
        {message && (
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    p-4 rounded shadow-lg text-white text-center w-80"
            style={{
              backgroundColor:
                message.type === "success"
                  ? "#4CAF50"
                  : message.type === "error"
                  ? "#F44336"
                  : "#FFC107",
            }}
          >
            {message.text}
          </div>
        )}
      </div>
    );
};

export default DocumentListContainer;
