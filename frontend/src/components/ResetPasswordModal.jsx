import PropTypes from 'prop-types';
import { useState } from 'react';
import { getToken } from '../utils/authUtil';
const ResetPasswordModal = ({ isOpen, user, onClose, onResetPassword }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const token = getToken();

    const handleReset = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');      
        await onResetPassword(user.email, newPassword, token);
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Reset Password for {user.email}</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                </div>
                <div className="mb-4 flex items-center">
                    <input
                        type="checkbox"
                        id="show-password"
                        className="mr-2"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                    />
                    <label htmlFor="show-password" className="text-sm">
                        Show Password
                    </label>
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-end gap-2">
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                        onClick={handleReset}
                    >
                        Reset Password
                    </button>
                </div>
            </div>
        </div>
    );
};

ResetPasswordModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onResetPassword: PropTypes.func.isRequired,
};

export default ResetPasswordModal;
