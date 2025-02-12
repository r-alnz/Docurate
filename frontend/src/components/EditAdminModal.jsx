import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useOrganizationContext } from "../hooks/useOrganizationContext";

import { useAuthContext } from '../hooks/useAuthContext';

const EditAdminModal = ({ isOpen, user, onClose, onEdit, suborganizations }) => {
    console.log("Organizations from context:", suborganizations);

    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        role: "",
        studentId: "",
        suborganizations: [],
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstname: user.firstname || "",
                lastname: user.lastname || "",
                email: user.email || "",
                role: user.role || "",
                studentId: user.role === 'student' ? user.studentId || '' : '',
                suborganizations: Array.isArray(user?.suborganizations)
                    ? user.suborganizations.map(suborg => suborg._id)
                    : [],
            });
        }
    }, [user]);

    const userSuborganizations = formData.suborganizations.length
    ? formData.suborganizations
        .map(suborgId => {
            const suborg = suborganizations.find(org => org._id === suborgId);
            return suborg ? suborg.firstname + " " + suborg.lastname || "(No Name)" : "Unknown";
        })
        .join(", ")
    : "No suborganizations assigned";
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onEdit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm">
                <h2 className="text-lg font-bold mb-4">Edit User</h2>
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700">First Name</label>
                        <input
                            type="text"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Last Name</label>
                        <input
                            type="text"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    
                    {user.role === 'student' && (
                        <div className="mb-4">
                            <label className="block text-gray-700">Student ID</label>
                            <input
                                type="text"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleInputChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Suborganizations</label>
                        <div className="border rounded p-2 w-full h-32 overflow-y-auto">
                            {userSuborganizations}
                        </div>
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
                            onClick={handleSubmit}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EditAdminModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default EditAdminModal;
