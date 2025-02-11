import { useState } from 'react';
import PropTypes from 'prop-types';

const AddOrganizationModal = ({ isOpen, onClose, onSubmit }) => {
    const [organizationName, setOrganizationName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (organizationName.trim()) {
            onSubmit(organizationName);
            setOrganizationName(''); // Clear input field
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-xl font-bold mb-4">Add Organization</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="organizationName"
                            className="block text-gray-700 font-medium mb-2"
                        >
                            Organization Name
                        </label>
                        <input
                            type="text"
                            id="organizationName"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            placeholder="Enter organization name"
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AddOrganizationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default AddOrganizationModal;
