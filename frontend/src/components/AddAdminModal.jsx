import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchOrganizations } from '../services/superAdminService';
import { useAuthContext } from '../hooks/useAuthContext';
import { useOrganizationContext } from '../hooks/useOrganizationContext';

const AddAdminModal = ({ isOpen, onClose, onSubmit }) => {
  const { token } = useAuthContext();
  const { organizations: contextOrganizations, dispatch } = useOrganizationContext();

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [role, setRole] = useState('admin'); // Default role is admin
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [position, setPosition] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const loadOrganizations = async () => {
      if (contextOrganizations.length > 0) {
        setOrganizations(contextOrganizations);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchOrganizations(token);
        setOrganizations(data.organizations);
        dispatch({ type: 'SET_ORGANIZATIONS', payload: data.organizations });
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadOrganizations();
    }
  }, [token, isOpen, contextOrganizations, dispatch]);

  const validatePassword = (value) => {
    setPassword(value);

    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
    } else if (
      !/^(?=.*[A-Za-z])(?=.*[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(value)
    ) {
      setPasswordError('Password must include at least one letter and one number or symbol');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError) {
      alert('Please fix the errors before submitting');
      return;
    }

    const userDetails = { firstname, lastname, email, birthdate, password, role, organization, position };

    try {
      await onSubmit(userDetails);
      alert('✅ Submission successful!');

      // Reset form fields
      setFirstname('');
      setLastname('');
      setEmail('');
      setBirthdate('');
      setPassword('');
      setPasswordError('');
      setRole('admin');
      setOrganization('');
      setPosition('');
    } catch (error) {
      console.error('❌ Submission failed:', error);
      alert('❌ Submission failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 md:p-6 rounded shadow-lg max-w-lg w-full h-auto max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Admin</h2>
        <form onSubmit={handleSubmit}>
          {/* Organization */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Organization
            </label>
            {loading ? (
              <p>Loading organizations...</p>
            ) : (
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="border rounded p-2 w-full"
                required
              >
                <option value="">Select an organization</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Position */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Position
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>

          {/* First Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              First Name
            </label>
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          {/* Birthdate */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Birthdate
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="border rounded p-2 w-full"
              required
              max={maxDate} // Restrict to at least 18 years old
            />
          </div>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="mt-2 w-full bg-gray-200 text-gray-700 border border-gray-300 rounded p-2 hover:bg-gray-300"
            >
              {showPassword ? '🙈 Hide Password' : '👁️ Show Password'}
            </button>
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>


          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
              disabled={loading}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddAdminModal;
