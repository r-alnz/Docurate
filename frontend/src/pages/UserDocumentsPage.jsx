import { useState } from 'react';
import DocumentListContainer from '../components/DocumentListContainer';
import AddDocumentModal from '../components/AddDocumentModal';

const UserDocumentsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">User Documents Page</h1>
            <p>Welcome to the user documents page. Manage your documents here.</p>
            <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
                Create New Document
            </button>
            {isModalOpen && <AddDocumentModal onClose={() => setIsModalOpen(false)} />}
            <DocumentListContainer />
        </div>
    );
};

export default UserDocumentsPage;
