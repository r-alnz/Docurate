// DocumentContext.jsx
import React, { createContext, useReducer } from 'react';

// Create the context
export const DocumentContext = createContext();

// Define the reducer
export const documentReducer = (state, action) => {
    switch (action.type) {
        case 'SET_DOCUMENTS':
            return {
                ...state,
                documents: action.payload,
                loading: false,
                error: null
            };
        case 'SET_ALL_DOCUMENTS':
            return {
                ...state,
                allDocuments: action.payload,
                documents: action.payload,
                loading: false,
                error: null
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        case 'DELETE_DOCUMENT':
            return {
                ...state,
                documents: state.documents.map(doc =>
                    doc._id === action.payload
                        ? { ...doc, status: 'inactive' }
                        : doc
                ),
                allDocuments: state.allDocuments?.map(doc =>
                    doc._id === action.payload
                        ? { ...doc, status: 'inactive' }
                        : doc
                ) || []
            };
        case 'RECOVER_DOCUMENT':
            console.log('RECOVER_DOCUMENT payload:', action.payload);
            return {
                ...state,
                documents: state.documents.map(doc =>
                    doc._id === action.payload._id
                        ? { ...doc, status: 'active' }
                        : doc
                ),
                allDocuments: state.allDocuments?.map(doc =>
                    doc._id === action.payload._id
                        ? { ...doc, status: 'active' }
                        : doc
                ) || []
            };
        case 'REMOVE_FROM_VIEW':
            return {
                ...state,
                documents: state.documents.filter(doc => doc._id !== action.payload)
            };
        case 'ERASE_DOCUMENT':
            return {
                ...state,
                documents: state.documents.filter(doc => doc._id !== action.payload),
                allDocuments: state.allDocuments?.filter(doc => doc._id !== action.payload) || []
            };
        default:
            return state;
    }
};

// Create the provider component
export const DocumentProvider = ({ children }) => {
    const [state, dispatch] = useReducer(documentReducer, {
        documents: [],
        allDocuments: [],
        loading: false,
        error: null
    });

    return (
        <DocumentContext.Provider value={{ ...state, dispatch }}>
            {children}
        </DocumentContext.Provider>
    );
};