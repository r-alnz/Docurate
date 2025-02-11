import { useContext } from 'react';
import { DocumentContext } from '../contexts/DocumentContext';
// Custom hook to use DocumentContext
const useDocumentContext = () => {
    const context = useContext(DocumentContext);
    if (!context) {
        throw new Error('useDocumentContext must be used within a DocumentProvider');
    }
    return context;
};

export { useDocumentContext };