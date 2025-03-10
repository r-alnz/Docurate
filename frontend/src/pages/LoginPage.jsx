import { useState, useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/authUtil';
import { getUserDetails } from '../services/authService';
import { useAuthContext } from '../hooks/useAuthContext';
import Loader from '../components/Loader';

const LoginPage = () => {
    const { user, dispatch } = useAuthContext();
    const { login, loading, error } = useLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // If the user is already logged in, redirect to the appropriate route
        const token = getToken();

        if (token) {
            getUserDetails(token)
                .then((userDetails) => {
                    dispatch({
                        type: 'LOGIN',
                        payload: { user: userDetails, token },
                    });
                    navigate(getRedirectPath(userDetails.role)); // Redirect based on role
                })
                .catch((err) => {
                    console.error('Failed to fetch user details:', err);
                });
        }
    }, [user, dispatch, navigate]);

    if(loading) {
        return <Loader />;
    }

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
        try {
            await login(email, password);
            if (user) {
                navigate(getRedirectPath(user.role));
            }
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    return (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-6">Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
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

                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        required
                    />
                </div>

                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
