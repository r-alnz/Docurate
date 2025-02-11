import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
    Navigate,
} from 'react-router-dom';
import PropTypes from 'prop-types';

// Import Auth Context Hook
import { useAuthContext } from './hooks/useAuthContext';
// Import Layouts
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
// Import Pages
import LoginPage from './pages/LoginPage';
import SuperAdminAdminsPage from './pages/SuperAdminAdminsPage.jsx';
import SuperAdminOrganizationsPage from './pages/SuperAdminOrganizationsPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminTemplatesPage from './pages/AdminTemplatesPage.jsx';
import AdminTemplateCreationPage from './pages/AdminTemplateCreationPage.jsx';
import UserTemplatesPage from './pages/UserTemplatesPage.jsx';
import UserViewTemplatePage from './pages/UserViewTemplatePage.jsx';
import UserDocumentsPage from './pages/UserDocumentsPage.jsx';
import UserDocumentCreationPage from './pages/UserDocumentCreationPage.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRoles }) => {
    const { user } = useAuthContext();
    // console.log(user.role);
    // console.log(requiredRoles);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user role matches any of the allowed roles
    if (requiredRoles && !requiredRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Router Configuration
const App = () => {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                {/* Public Routes with AuthLayout */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Route>

                {/* Protected SuperAdmin Routes */}
                <Route
                    element={
                        <ProtectedRoute requiredRoles={['superadmin']}>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/admins" element={<SuperAdminAdminsPage />} />
                    <Route path="/organizations" element={<SuperAdminOrganizationsPage />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route
                    element={
                        <ProtectedRoute requiredRoles={['admin']}>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/users" element={<AdminUsersPage />} />
                    <Route path="/templates" element={<AdminTemplatesPage />} />
                    <Route path="/template-creation" element={<AdminTemplateCreationPage />} />
                    <Route path="/templates/:id" element={<AdminTemplateCreationPage />} />
                </Route>

                {/* Protected Student and Organization Routes */}
                <Route
                    element={
                        <ProtectedRoute requiredRoles={['student', 'organization']}>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/user-templates" element={<UserTemplatesPage />} />
                    <Route path="/user-templates/:id" element={<UserViewTemplatePage />} />
                    <Route path="/documents" element={<UserDocumentsPage />} />
                    <Route path="/documents/:id" element={<UserDocumentCreationPage />} />
                    <Route path="/document-creation/:templateId" element={<UserDocumentCreationPage />} />
                </Route>

                <Route
                    element={
                        <ProtectedRoute requiredRoles={['superadmin', 'admin', 'organization', 'student']}>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/change-password" element={<ChangePasswordPage />} />
                </Route>
            </>
        )
    );

    return <RouterProvider router={router} />;
};

// PropTypes Validation
ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRoles: PropTypes.arrayOf(PropTypes.string), // Support multiple roles
};

export default App;
