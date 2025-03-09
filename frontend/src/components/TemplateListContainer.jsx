import { useEffect, useState } from 'react';
import { useTemplateContext } from '../hooks/useTemplateContext';
import { fetchTemplates, fetchActiveTemplates, deleteTemplate, recoverTemplate, eraseTemplate } from '../services/templateService';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { getToken } from '../utils/authUtil';
import { useAuthContext } from '../hooks/useAuthContext';
import DeleteTemplateModal from './DeleteTemplateModal';

import { Mosaic } from 'react-loading-indicators';

import React from "react";

const TemplateListContainer = () => {
  const { templates, dispatch } = useTemplateContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [delayedLoading, setDelayedLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortOption, setSortOption] = useState('date-desc');
  const [statusFilter, setStatusFilter] = useState('active');
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setVisible(true), 500);
  }, []);
  
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    if (!user || !user.organization) return;

    const loadTemplates = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const token = getToken();
        const fetchedTemplates = await fetchTemplates(token);

        // Delay setting the templates to prevent UI flickering
        setTimeout(() => {
          dispatch({ type: 'SET_TEMPLATES', payload: fetchedTemplates });
          dispatch({ type: 'SET_LOADING', payload: false });
          setDelayedLoading(false);
        }, 1300); // Adjust timeout duration if needed
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch templates.' });
        setDelayedLoading(false);
      }
    };

    dispatch({ type: 'SET_TEMPLATES', payload: [] }); // Prevents stale data from showing
    loadTemplates();
  }, [dispatch, user]);

  if (delayedLoading) {
    return (
    <div className="flex mt-16 justify-center h-screen z-10 overflow-hidden">
       <Mosaic color={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]}
          size="large" text="Docurate!" />
        {/* <Mosaic color="#38B6FF" size="medium" text="" textColor="" /> */}
      </div>
  //     <div className="flex items-center justify-center h-screen">
  //       <Mosaic color="#38B6FF" size="medium" text="" textColor="" />
    );
  }



  const handleOpenModal = (template) => {
    setTemplateToDelete(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setTemplateToDelete(null);
    setIsModalOpen(false);
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      const token = getToken();
      await deleteTemplate(templateId, token);
      dispatch({ type: 'DELETE_TEMPLATE', payload: templateId });
      showMessage('Template archived successfully!');
    } catch (err) {
      showMessage('Failed to delete template. Please try again.');
    }
  };

  const handleRecoverTemplate = async (templateId) => {
    try {
      const token = getToken();
      const response = await recoverTemplate(templateId, token);
      dispatch({ type: 'RECOVER_TEMPLATE', payload: response.template });
      showMessage('Template recovered successfully!');
    } catch (error) {
      showMessage('Failed to recover the template. Please try again.');
    }
  };

  const handleEraseTemplate = async (templateId) => {
    try {
      const token = getToken();
      await eraseTemplate(templateId, token);
      dispatch({ type: 'ERASE_TEMPLATE', payload: templateId });
      showMessage('Template erased successfully!');
    } catch (error) {
      showMessage('Failed to erase the template. Please try again.');
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'All' || template.requiredRole === roleFilter;
    const matchesStatus = statusFilter === 'All' || template.status === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'date-asc': return new Date(a.createdAt) - new Date(b.createdAt);
      case 'date-desc': return new Date(b.createdAt) - new Date(a.createdAt);
      default: return 0;
    }
  });


  return (

      <div className={`p-4 relative transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
              {delayedLoading && (
  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 overflow-hidden">
       <Mosaic color={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]}
          size="large" text="Docurate!" />
        {/* <Mosaic color="#38B6FF" size="medium" text="" textColor="" /> */}
      </div>
    )}
      {/* {loading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      )} */}

      <h2 className="text-2xl font-bold mb-4">Available Templates</h2>

      <div className="mb-4 flex gap-4">
      {delayedLoading && (
  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 overflow-hidden">
       <Mosaic color={["#33CCCC", "#33CC36", "#B8CC33", "#FCCA00"]}
          size="large" text="Docurate!" />
        {/* <Mosaic color="#38B6FF" size="medium" text="" textColor="" /> */}
      </div>
    )}

        <input
          type="text"
          placeholder="Search templates by name, type, or subtype..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded w-full p-2 shadow"
        />
        {user.role === "admin" && (
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded p-2 shadow bg-white"
          >
            <option value="All">All</option>
            <option value="student">Student</option>
            <option value="organization">Organization</option>
          </select>
        )}
        {user.role === "admin" && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded p-2 shadow bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        )}

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border rounded p-2 shadow bg-white"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="date-asc">Date (Oldest First)</option>
          <option value="date-desc">Date (Newest First)</option>
        </select>
      </div>

      {sortedTemplates.length === 0 ? (
        <p>No templates found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTemplates.map((template) => (
            <div
              key={template._id}
              className={`border rounded p-4 shadow hover:shadow-lg transition-shadow duration-300 bg-white ${template.status === "inactive" ? "opacity-50" : ""
                }`}
            >
              {(() => {
                const matchingSuborg = template?.suborganizations?.find(
                  (templateSuborg) =>
                    user?.suborganizations?.some(
                      (userSuborg) =>
                        String(userSuborg._id) === String(templateSuborg._id)
                    )
                );
                return matchingSuborg ? (
                  <p className="flex justify-end text-yellow-600 italic">
                    Member Privilege!
                  </p>
                ) : null;
              })()}

              <div className="flex justify-end gap-2 mb-2">
                {template.suborganizations &&
                template.suborganizations.length > 0 ? (
                  template.suborganizations.map((suborg, index) => (
                  <span
                    key={suborg._id ? String(suborg._id) : `suborg-${index}`}
                    className="bg-violet-100 text-violet-800 text-sm font-medium px-2.5 py-0.5 rounded-full"
                  >
                    Special for: {suborg.firstname}
                  </span>
                ))
                ) : (
                  <span className="bg-gray-200 text-blue-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    General for: {user.organization.name}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
              <p className="text-gray-700 mb-1">
                <strong>Type:</strong> {template.type}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Subtype:</strong> {template.subtype || "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Role:</strong> {template.requiredRole}
              </p>
              <div className="mt-4 flex gap-2">
                {template.status === "inactive" ? (
                  <>
                    <button
                      className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                      onClick={() => handleRecoverTemplate(template._id)}
                    >
                      Recover
                    </button>
                    {user.role === "admin" && (
                      <button
                        className="bg-red-700 text-white py-2 px-4 rounded hover:bg-red-900"
                        onClick={() => handleEraseTemplate(template._id)}
                      >
                        Erase
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      className="bg-[#38b6ff] text-white py-2 px-4 rounded hover:bg-[#2a9ed6]"
                      onClick={() =>
                        navigate(
                          user.role === "admin"
                            ? `/templates/${template._id}`
                            : `/user-templates/${template._id}`
                        )
                      }
                    >
                      View
                    </button>
                    {user.role === "admin" && (
                      <button
                        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
                        onClick={() => handleOpenModal(template)}
                      >
                        Inactive
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {templateToDelete && (
        <DeleteTemplateModal
          isOpen={isModalOpen}
          template={templateToDelete}
          onClose={handleCloseModal}
          onDelete={handleDeleteTemplate}
        />
      )}

      {/* Mini Message Box (Centered) */}
      {message && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    p-4 rounded shadow-lg text-white text-center w-80"
          style={{
            backgroundColor:
              message.type === "success"
                ? "#4CAF50"
                : message.type === "error"
                  ? "#F44336"
                  : "#FFC107",
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default TemplateListContainer;
