import PropTypes from 'prop-types';
import { X, Trash2 } from 'lucide-react'

const DeleteAdminModal = ({ isOpen, user, onClose, onDelete }) => {
  const handleDelete = () => {
    onDelete(user._id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm">
        <h2 className="text-lg font-bold mb-4">Confirm Inactivation</h2>
        <p>
          Are you sure you want to inactivate{" "}
          <strong>
            {user.firstname} {user.lastname}
          </strong>
          ?
        </p>
        <div className="mt-4 flex justify-end gap-4">
          <button
            className="bg-gray-300 text-gray-700 p-2 rounded-lg shadow-md hover:bg-gray-400 transition duration-200 ease-in-out focus:ring-2 focus:ring-gray-300"
            onClick={onClose}
            title="Cancel"
          >
            <X size={20} />
          </button>

          <button
            className="bg-red-500 text-white p-2 rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out focus:ring-2 focus:ring-red-300"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default DeleteAdminModal;
