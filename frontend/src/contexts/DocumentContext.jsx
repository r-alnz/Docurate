import { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';

// Initial state for the document context
const initialState = {
    documents: [],
    loading: false,
    error: null,
};

// Reducer function to manage document state
const documentReducer = (state, action) => {
    switch (action.type) {
        case 'SET_DOCUMENTS':
            return { ...state, documents: action.payload, loading: false, error: null };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'ADD_DOCUMENT':
            return { ...state, documents: [...state.documents, action.payload] };
        case 'UPDATE_DOCUMENT':
            return {
                ...state,
                documents: state.documents.map((doc) =>
                    doc._id === action.payload._id ? action.payload : doc
                ),
            };
        case 'DELETE_DOCUMENT':
            return {
                ...state,
                documents: state.documents.filter((doc) => doc._id !== action.payload),
            };
        case 'CLEAR_DOCUMENTS':
            return { ...initialState }; // Reset state
        default:
            return state;
    }
};

// Create DocumentContext
const DocumentContext = createContext();

// DocumentProvider component to wrap your app
const DocumentProvider = ({ children }) => {
    const [state, dispatch] = useReducer(documentReducer, initialState);

    return (
        <DocumentContext.Provider value={{ ...state, dispatch }}>
            {children}
        </DocumentContext.Provider>
    );
};

export { DocumentContext, DocumentProvider };

DocumentProvider.propTypes = {
    children: PropTypes.node.isRequired,
};


