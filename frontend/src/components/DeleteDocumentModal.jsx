import PropTypes from 'prop-types';

const DeleteDocumentModal = ({ isOpen, documentTitle, onClose, onDelete }) => {
    const handleDelete = () => {
        onDelete(); // Call the delete function
        onClose(); // Close the modal after deletion
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm">
                <h2 className="text-lg font-bold mb-4">Confirm Inactivation</h2>
                <p>
                    Are you sure you want to inactivate the document{' '}
                    <strong>{documentTitle}</strong>?
                </p>
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                        onClick={handleDelete}
                    >
                        Inactivate
                    </button>
                </div>
            </div>
        </div>
    );
};

DeleteDocumentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    documentTitle: PropTypes.string.isRequired, // Title of the document
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default DeleteDocumentModal;
