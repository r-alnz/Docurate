import { useNavigate } from 'react-router-dom';
import TemplateListContainer from '../components/TemplateListContainer';

const AdminTemplatesPage = () => {
    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate('/template-creation');
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Templates Page</h1>
            <p>Welcome to the admin templates page. Manage your templates here.</p>
            <button
                onClick={handleRedirect}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
                Create New Template
            </button>
            <TemplateListContainer />
        </div>
    );
};

export default AdminTemplatesPage;
