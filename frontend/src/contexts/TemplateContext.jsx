import { createContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchTemplates, fetchActiveTemplates } from '../services/templateService';
import { getToken } from '../utils/authUtil';
import { useAuthContext } from '../hooks/useAuthContext';
// Initial state for templates
const initialState = {
    templates: [],
    loading: true,
    error: null,
};

// Reducer function for managing template state
const templateReducer = (state, action) => {
    switch (action.type) {
        case 'SET_TEMPLATES':
            return { ...state, loading: false, templates: action.payload, error: null };
        case 'ADD_TEMPLATE':
            return { ...state, templates: [...state.templates, action.payload] };
        case 'UPDATE_TEMPLATE':
            return {
                ...state,
                templates: state.templates.map((template) =>
                    template._id === action.payload._id ? action.payload : template
                ),
            };
        case 'DELETE_TEMPLATE':
            return {
                ...state,
                templates: state.templates.map((template) =>
                    template._id === action.payload
                        ? { ...template, status: 'inactive' } // Update status to inactive
                        : template
                ),
            };
        case 'RECOVER_TEMPLATE':
            return {
                ...state,
                templates: state.templates.map((template) =>
                    template._id === action.payload._id
                        ? { ...template, status: 'active' }
                        : template
                ),
            };
                     
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'LOGOUT':
            return { ...initialState };
        // case 'FILTER_TEMPLATES':
        //     {const { type, subtype } = action.payload;
        //     const filteredTemplates = state.templates.filter((template) => {
        //         const matchesType = !type || template.type === type;
        //         const matchesSubtype = !subtype || template.subtype?.toLowerCase() === subtype.toLowerCase();
        //         return matchesType && matchesSubtype;
        //     });
        //     return { ...state, templates: filteredTemplates, loading: false };}
        default:
            return state;
    }
};


// Create context
const TemplateContext = createContext();

// Context provider
const TemplateProvider = ({ children }) => {
    const [state, dispatch] = useReducer(templateReducer, initialState);
    const { user } = useAuthContext();

    useEffect(() => {
        const loadTemplatesIfNeeded = async () => {
            // Check if user is logged in and templates array is empty
            if (user && user.role != "superadmin" && state.templates.length === 0) {
                dispatch({ type: 'SET_LOADING', payload: true });

                try {
                    const token = getToken(); // Get the token from your auth utility
                    var templates = [];
                    if(user.role === 'admin') {
                        templates = await fetchTemplates(token);
                    } else {
                        templates = await fetchActiveTemplates(token);
                    }                   
                    dispatch({ type: 'SET_TEMPLATES', payload: templates });
                } catch (error) {
                    dispatch({ type: 'SET_ERROR', payload: error.message });
                }
            }
        };

        loadTemplatesIfNeeded();
    }, [state.templates, user]); // Fetch templates only if templates array is empty

    return (
        <TemplateContext.Provider value={{ ...state, dispatch }}>
            {children}
        </TemplateContext.Provider>
    );
};

TemplateProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { TemplateContext, TemplateProvider };
