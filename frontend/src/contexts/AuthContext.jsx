import { createContext, useReducer, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getUserDetails } from '../services/authService';
import { getToken } from '../utils/authUtil';
import Loader from '../components/Loader';

// Initial state for the auth context
const initialState = {
    user: null,
    token: null,
};

// Auth reducer function
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
            };
        default:
            return state;
    }
};

// Create AuthContext
const AuthContext = createContext();

// AuthProvider Component
const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const [loading, setLoading] = useState(true);

    // Log state changes
    // useEffect(() => {
    //     console.log('AuthContext updated:', state);
    // }, [state]);

    // Initialize user details if token exists
    useEffect(() => {
        const token = getToken();
        if (token) {
            getUserDetails(token)
                .then((user) => {
                    dispatch({ type: 'LOGIN', payload: { user, token } });
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Failed to fetch user details:', error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {loading ? <Loader /> : children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node,
};

export { AuthContext, AuthProvider };
