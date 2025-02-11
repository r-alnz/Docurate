import { useContext } from 'react';
import { OrganizationContext } from '../contexts/OrganizationContext';
const useOrganizationContext = () => {
    const context = useContext(OrganizationContext);

    if (!context) {
        throw new Error(
            'useOrganizationContext must be used within an OrganizationProvider'
        );
    }

    return context;
};

export { useOrganizationContext };
