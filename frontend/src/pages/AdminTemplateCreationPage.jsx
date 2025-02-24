import TemplateContainer from '../components/TemplateContainer'
import { useAuthContext } from '../hooks/useAuthContext';
import { useUserContext } from '../hooks/useUserContext';

const AdminTemplateCreationPage = () => {
  const { users } = useUserContext();
  const suborganizations = users.filter(user => user.role === "organization");

  console.log("EEe", JSON.stringify(suborganizations));
  
  return (
    <>
        <TemplateContainer
        suborgs={suborganizations}/>
    </>
  )
}

export default AdminTemplateCreationPage