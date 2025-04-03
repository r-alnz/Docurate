import { useEffect, useState } from "react";
import { useAuthContext } from '../hooks/useAuthContext';
import axios from "axios";
import { getApiUrl } from "../api.js";

import RequestStatusSelect from "../components/RequestStatusSelect.jsx";

const API_URL = getApiUrl("/removals");

const RemovalRequestsPage = () => {
  const { user, token } = useAuthContext();
  const [removalRequests, setRemovalRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [editingStatus, setEditingStatus] = useState(null); // To keep track of the status we're editing
  const [newStatus, setNewStatus] = useState(""); // For storing the new status temporarily

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          console.error("No token found!");
          return;
        }

        const response = await axios.get(`${API_URL}/remove-request`, {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure token is included
          },
        });

        // Sort the requests by date (latest first)
        const sortedRequests = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRemovalRequests(sortedRequests);
      } catch (error) {
        console.error("Error fetching removal requests:", error);
      }
    };

    fetchRequests();
  }, []);

  // Filter removal requests based on status
  const filteredRequests = selectedStatus === "all"
    ? removalRequests
    : removalRequests.filter((request) => request.status === selectedStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Function to handle status change
  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found!");
        return;
      }
  
      // Send the PATCH request to update the status
      const response = await axios.patch(
        `${API_URL}/remove-request/${requestId}`,
        { status: newStatus }, // Data to be sent in the request body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token in the header
          },
        }
      );
  
      console.log("Status updated:", response.data);
  
      // Optionally update the UI with the new status
      setRemovalRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === requestId ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="p-6">

      <div className="flex justify-between mb-3">
      <h2 className="text-2xl font-bold mb-4 rounded-lg">Removal Requests</h2>
      <div><select
          id="statusFilter"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border rounded-lg bg-gray-100"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select></div>
      </div>

      {filteredRequests.length === 0 ? (
        <p>No removal requests found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div key={request._id} className="bg-gray-100 p-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300">

              <div className="REQUESTING p-3">
                <div className="flex justify-between">
                
                  <div className="flex-col">
                    <div className="-mt-2 text-xs text-gray-400">
                      {new Date(request.date).toLocaleString()}
                    </div>

                    <div className="text-lg font-semibold">
                      {request.requestingUser}
                    </div>
                  </div>

                  {/* <div className="relative">
                    <select
                    className={`border p-2 rounded-xl cursor-pointer ${getStatusColor(request.status)} appearance-none text-center text-sm text-white`}
                    value={request.status}
                    onChange={(e) => handleStatusChange(request._id, e.target.value)}
                  >
                      <option value="pending" className="p-3">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div> */}

{/* Use the CustomSelect component here */}
<div className="flex items-center">
                    <RequestStatusSelect
                      request={request}
                      handleStatusChange={handleStatusChange}
                    />
                  </div>

                </div>

                <div className="REMOVING mt-1">

                  {/* INFO */}
                  <div className="flex items-center">
                    <div className="bg-gray-400 pl-2 h-6 flex items-center text-xs text-white rounded-l-lg">
                      {request.studentId}
                    </div>
                    <div className="pl-3 pb-1 bg-gradient-to-r h-6 from-gray-400 to-white bg-no-repeat items-center"
                      style={{ backgroundSize: '20% 100%' }}>
                      {request.removingUser}
                    </div>
                  </div>

                  <div className="mt-2 text-gray-700 italic mb-5">
                  {request.reason ? request.reason : "Reason not specified."}
                  </div>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RemovalRequestsPage;
