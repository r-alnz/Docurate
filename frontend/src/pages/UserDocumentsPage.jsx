import { useState } from 'react';
import DocumentListContainer from '../components/DocumentListContainer';
import AddDocumentModal from '../components/AddDocumentModal';
import {File} from 'lucide-react';

const UserDocumentsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">User Documents Page</h1>
        <p>Welcome to the user documents page. Manage your documents here.</p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 bg-[#38b6ff] text-white py-2 px-4 rounded hover:bg-[#2a9ed6] flex items-center transition-all duration-200 transform hover:scale-105"
        >
          <File className="w-5 h-5 mr-2" />
          Create New Document
        </button>

        {isModalOpen && (
          <AddDocumentModal onClose={() => setIsModalOpen(false)} />
        )}
        <DocumentListContainer />
      </div>
    );
};

export default UserDocumentsPage;
