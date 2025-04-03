import { useNavigate } from 'react-router-dom';
import TemplateListContainer from '../components/TemplateListContainer';
import {File, X} from "lucide-react"

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
          className="mt-4 bg-[#38b6ff] text-white py-2 px-4 rounded hover:bg-[#2a9ed6] flex items-center transition-all duration-200 transform hover:scale-105"
        >
          <File className="w-5 h-5 mr-2" />
          Create New Template
        </button>

        <TemplateListContainer />
      </div>
    );
};

export default AdminTemplatesPage;
