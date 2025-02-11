import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/authService.js'; // Adjust path if needed
import { getToken } from '../utils/authUtil';
import { useAuthContext } from '../hooks/useAuthContext';
const ChangePasswordPage = () => {
    const { user } = useAuthContext();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const toggleShowPasswords = () => setShowPasswords(!showPasswords);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }

        try {
            const token = getToken();
            await changePassword(currentPassword, newPassword, token);
            setSuccess('Password changed successfully');
            setTimeout(() => navigate('/'), 2000); // Redirect after success
        } catch (err) {
            setError(err.message || 'Failed to change password');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Change Password</h1>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}

                {/* Hidden Username/Email Field */}
                <input
                        type="text"
                        value={user?.email || ''} // Assuming you have the user's email in context
                        autoComplete="username"
                        readOnly
                        hidden
                />

                <label className="block text-gray-700 font-medium mb-2">Current Password</label>
                <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border rounded p-2 mb-4"
                    required
                    autoComplete="current-password"
                />

                <label className="block text-gray-700 font-medium mb-2">New Password</label>
                <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border rounded p-2 mb-4"
                    required
                    autoComplete="new-password"
                />

                <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border rounded p-2 mb-4"
                    required
                    autoComplete="new-password"
                />

                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        id="showPasswords"
                        checked={showPasswords}
                        onChange={toggleShowPasswords}
                        className="mr-2"
                    />
                    <label htmlFor="showPasswords" className="text-gray-700">
                        Show Passwords
                    </label>
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Change Password
                </button>
            </form>
        </div>
    );
};

export default ChangePasswordPage;
