import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/authService.js';
import { getToken } from '../utils/authUtil';
import { useAuthContext } from '../hooks/useAuthContext';

const ChangePasswordPage = () => {
  const { user } = useAuthContext();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setConfirmPasswordError('');
    setSuccess('');

    if (passwordError) return;

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('New password and confirm password do not match');
      return;
    }

    try {
      const token = getToken();
      await changePassword(currentPassword, newPassword, token);
      setSuccess('Password changed successfully');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Change Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ Success and Error Messages */}
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          {/* Hidden Username/Email Field */}
          <input
            type="text"
            value={user?.email || ''}
            autoComplete="username"
            readOnly
            hidden
          />

          {/* Current Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Current Password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              autoComplete="current-password"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              New Password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => validatePassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              autoComplete="new-password"
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirm New Password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              autoComplete="new-password"
            />
          </div>

          {/* ✅ Show Password Button */}
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="mt-2 w-full bg-gray-200 text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-300 transition flex justify-center items-center"
          >
            {showPasswords ? '🙈 Hide Password' : '👁️ Show Password'}
          </button>

          {/* ✅ Submit Button */}
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition ${passwordError || confirmPasswordError || !currentPassword || !newPassword || !confirmPassword
                ? 'opacity-50 cursor-not-allowed'
                : ''
              }`}
            disabled={
              passwordError ||
              confirmPasswordError ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
          >
            🔒 Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
