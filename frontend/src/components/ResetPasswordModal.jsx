import PropTypes from 'prop-types';
import { useState } from 'react';
import { getToken } from '../utils/authUtil';

const ResetPasswordModal = ({ isOpen, user, onClose, onResetPassword }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const token = getToken();

    // ✅ Password validation function
    const validatePassword = (value) => {
        setNewPassword(value);

        if (value.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
        } else if (
            !/^(?=.*[A-Za-z])(?=.*[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(value)
        ) {
            setPasswordError('Password must include at least one letter and one number or symbol');
        } else {
            setPasswordError('');
        }
    };

    const handleReset = async () => {
        if (passwordError) return;

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return;
        }

        setConfirmPasswordError('');
        await onResetPassword(user.email, newPassword, token);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-4 w-96">
                <h2 className="text-lg font-semibold mb-4">Reset Password for {user.email}</h2>

                {/* New Password */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => validatePassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {/* ✅ Error message */}
                    {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {/* ✅ Confirm Password Error */}
                    {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
                </div>

                {/* ✅ Show Password Button */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="bg-[#38b6ff] text-white py-2 px-4 rounded hover:bg-[#2a9ed6] transition"
                >
                    {showPassword ? '🙈 Hide Password' : '👁️ Show Password'}
                </button>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        onClick={handleReset}
                        disabled={passwordError || !newPassword || !confirmPassword}
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
