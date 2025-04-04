// In your DocumentContext.js or wherever your reducer is defined
export const documentReducer = (state, action) => {
    switch (action.type) {
        case 'SET_DOCUMENTS':
            return {
                ...state,
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
                )
            };
        case 'RECOVER_DOCUMENT':
            return {
                ...state,
                documents: state.documents.map(doc =>
                    doc._id === action.payload._id
                        ? action.payload
                        : doc
                )
            };
        case 'ERASE_DOCUMENT':
            return {
                ...state,
                documents: state.documents.filter(doc => doc._id !== action.payload)
            };
        default:
            return state;
    }
};