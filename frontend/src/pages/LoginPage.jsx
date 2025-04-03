import { useState, useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/authUtil';
import { getUserDetails } from '../services/authService';
import { useAuthContext } from '../hooks/useAuthContext';
import { Eye, EyeOff} from "lucide-react"
import '../index.css';

const LoginPage = () => {
    const { user, dispatch } = useAuthContext();
    const { login, loading, error } = useLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const [showPasswords, setShowPasswords] = useState ("")

    useEffect(() => {
        const token = getToken();

        if (token) {
            getUserDetails(token)
                .then((userDetails) => {
                    dispatch({
                        type: 'LOGIN',
                        payload: { user: userDetails, token },
                    });
                    navigate(getRedirectPath(userDetails.role));
                })
                .catch((err) => {
                    console.error('Failed to fetch user details:', err);
                });
        }
    }, [user, dispatch, navigate]);

    const getRedirectPath = (role) => {
        switch (role) {
            case 'superadmin':
                return '/admins';
            case 'admin':
                return '/users';
            case 'student':
            case 'organization':
                return '/user-templates';
            default:
                return '/';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nextAttempts = failedAttempts + 1;

        if (nextAttempts >= 5) {
            setMessage('Please contact your school admin to reset your password.');
            setFailedAttempts(0); // Reset attempts after showing the message

            // Clear message after 5 seconds
            setTimeout(() => setMessage(null), 5000);
            return; // Prevent further execution
        }

        setFailedAttempts(nextAttempts); // Update state after checking

        try {
            await login(email, password);
            if (user) {
                navigate(getRedirectPath(user.role));
            }
        } catch (err) {
            console.error('Login failed:', err);
            setMessage('Invalid email or password. Please try again.');

            // Clear message after 5 seconds
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 peek-box">
        <div className="donut-container">
          <div className="donut"></div>
        </div>

        {/* Display message */}
        {message && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>

          <div className="mb-4">
            {/* Label */}
            <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>

        
                <div className="relative w-full">
  {/* Input Field */}
  <input
    id="password"
    type={showPasswords ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="shadow appearance-none border rounded w-full py-2 pr-10 px-3 text-gray-700"
    required
  />

  {/* ✅ Show Password Button (Positioned inside the input) */}
  <button
    type="button"
    onClick={() => setShowPasswords(!showPasswords)}
    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition z-10"
  >
    {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>
</div>

          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`login-button font-bold py-2 px-4 rounded ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    );
};

export default LoginPage;
