import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { logIn } from '../services/authService';
import { setToken } from '../utils/authUtil';

const useLogin = () => {
    const { dispatch } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            // Authenticate and get token + user info
            const { user, token } = await logIn(email, password);

            // Save token locally
            setToken(token);

            // console.log('User:', user);
            // console.log('Token:', token);
            // Dispatch user info and token to auth context
            dispatch({
                type: 'LOGIN',
                payload: { user, token },
            });
        } catch (error) {
            // Handle error responses from the backend
            setError(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
};

export { useLogin };
