import { useOrganizationContext } from "../hooks/useOrganizationContext";
import { useAuthContext } from '../hooks/useAuthContext';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditAdminModal = ({ isOpen, user, onClose, onEdit, suborganizations }) => {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        role: "",
        studentId: "",
        organization: "",
        suborganizations: [],
        birthdate: "",
        college: "",
        course: "",
        position: "",
    });

    const [selectedSubOrgs, setSelectedSubOrgs] = useState([]);
    const [confirmSave, setConfirmSave] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (formData.suborganizations) {
            setSelectedSubOrgs([...formData.suborganizations]);
        }
    }, [formData.suborganizations]);

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
                birthdate: user.birthdate ? user.birthdate.split("T")[0] : "",
                college: user.college || "",
                course: user.course || "",
                organization: user.organization || "",
                position: user.role === 'admin' ? user.position || '' : ''
            });
        }
    }, [user]);

    const toggleSubOrg = (suborgId) => {
        setSelectedSubOrgs((prev) =>
            prev.includes(suborgId)
                ? prev.filter((id) => id !== suborgId)
                : [...prev, suborgId]
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setConfirmSave(true);
    };

    const confirmSubmit = async () => {
        if (!user || !user._id) {
            setMessage({ type: 'error', text: '❌ Error: Missing user ID' });
            return;
        }

        const updatedUser = {
            ...formData,
            suborganizations: selectedSubOrgs.length ? selectedSubOrgs : [],
            birthdate: formData.birthdate ? new Date(formData.birthdate).toISOString() : null,
            college: formData.college.trim(),
            course: formData.course.trim(),
            position: formData.position.trim(),
        };

        try {
            await onEdit(user._id, updatedUser);
            setMessage({ type: 'success', text: '✅ Edit successful!' });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                onClose();
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Edit failed. Please try again.' });
        } finally {
            setConfirmSave(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Edit User</h2>

                {/* ✅ SUCCESS/ERROR MESSAGE */}
                {message.text && (
                    <div className={`p-2 mb-4 text-sm rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

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
                    <div className="mb-4">
                        <label className="block text-gray-700">Birthdate</label>
                        <input
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {/* ✅ SUBORGANIZATIONS */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Suborganizations</label>
                        <div className="border rounded p-2 w-full h-32 overflow-y-auto">
                            {suborganizations.map((org) => (
                                <div
                                    key={org._id}
                                    onClick={() => toggleSubOrg(org._id)}
                                    className={`p-2 cursor-pointer ${selectedSubOrgs.includes(org._id)
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        } rounded mb-1`}
                                >
                                    {org.firstname || "(No Name)"}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ✅ ACTION BUTTONS */}
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

            {/* ✅ CONFIRMATION DIALOG */}
            {confirmSave && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded shadow-lg">
                        <p className="text-gray-800 mb-4">Are you sure you want to save these changes?</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setConfirmSave(false)}
                                className="bg-gray-300 text-gray-700 py-1 px-4 rounded mr-2 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSubmit}
                                className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

EditAdminModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    suborganizations: PropTypes.array.isRequired
};

export default EditAdminModal;
