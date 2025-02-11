import PropTypes from 'prop-types';
import { AuthProvider } from './AuthContext';
import { OrganizationProvider } from './OrganizationContext.jsx';
import { UserProvider } from './UserContext';
import { TemplateProvider } from './TemplateContext.jsx';
import { DocumentProvider } from './DocumentContext.jsx';
const AppProvider = ({ children }) => {
    return (
        <AuthProvider>
            <UserProvider>
                <OrganizationProvider>
                    <TemplateProvider>
                        <DocumentProvider>
                        {children}
                        </DocumentProvider>
                    </TemplateProvider>
                </OrganizationProvider>
            </UserProvider> 
        </AuthProvider>
    );
};

export default AppProvider;

AppProvider.propTypes = {
    children: PropTypes.node,
}
