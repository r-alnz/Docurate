import { useEffect, useState } from "react";
import { useAuthContext } from '../hooks/useAuthContext';
import axios from "axios";
import { getApiUrl } from "../api.js";

const API_URL = getApiUrl("/removals");

const RemovalRequestsPage = () => {
  const { user, token } = useAuthContext();
  const [removalRequests, setRemovalRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");

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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Removal Requests</h2>

      <div className="mb-4">
        <label htmlFor="statusFilter" className="mr-2">Filter by Status:</label>
        <select
          id="statusFilter"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <p>No removal requests found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div key={request._id} className="bg-gray-100 p-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300">

              <div className="REQUESTING mt-2">
                <div className="flex justify-between">
                
                  <div className="flex-col">
                    <div className="-mt-2 text-xs text-gray-400">
                      {new Date(request.date).toLocaleString()}
                    </div>

                    <div className="text-lg font-semibold">
                      {request.requestingUser}
                    </div>
                  </div>

                  <div className={`-mt-2 pr-3 h-[30px] flex items-center pl-3 rounded-xl text-white ${getStatusColor(request.status)}`}>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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

                  <div className="mt-2 text-gray-700 italic">
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
