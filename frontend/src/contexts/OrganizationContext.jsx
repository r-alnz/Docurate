import { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';

const initialState = {
    organizations: [],
    loading: false,
    error: null,
};

const organizationReducer = (state, action) => {
    switch (action.type) {
        case 'SET_ORGANIZATIONS':
            return { ...state, organizations: action.payload, loading: false, error: null };
        case 'ADD_ORGANIZATION':
            return { ...state, organizations: [...state.organizations, action.payload] };
        case 'REMOVE_ORGANIZATION':
            return {
                ...state,
                organizations: state.organizations.filter(org => org._id !== action.payload),
            };
        case 'LOGOUT':
            return { ...initialState };
        default:
            return state;
    }
};

const OrganizationContext = createContext();

const OrganizationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(organizationReducer, initialState);

    return (
        <OrganizationContext.Provider value={{ ...state, dispatch }}>
            {children}
        </OrganizationContext.Provider>
    );
};

OrganizationProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { OrganizationContext, OrganizationProvider };
