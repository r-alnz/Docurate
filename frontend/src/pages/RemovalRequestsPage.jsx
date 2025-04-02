import { useEffect, useState } from "react";
import { useAuthContext } from '../hooks/useAuthContext';
import axios from "axios";
import { getApiUrl } from "../api.js";

const API_URL = getApiUrl("/removals");

const RemovalRequestsPage = () => {
  const { user, token } = useAuthContext();
  const currUserID = user._id;
  console.log("user idd: ", currUserID);
  const [removalRequests, setRemovalRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log("Token:", token);

        if (!token) {
            console.error("No token found!");
            return;
        }

        const response = await axios.get(`${API_URL}/remove-request`, {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure token is included
          },
        });
        setRemovalRequests(response.data);
      } catch (error) {
        console.error("Error fetching removal requests:", error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Pending Removal Requests</h2>

      {removalRequests.length === 0 ? (
        <p>No pending removal requests.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Requesting User</th>
              <th className="border p-2">Removing User</th>
              <th className="border p-2">Student ID</th>
              <th className="border p-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {removalRequests.map((request) => (
              <tr key={request._id} className="border">
                <td className="border p-2">{request.requestingUser}</td>
                <td className="border p-2">{request.removingUser}</td>
                <td className="border p-2">{request.studentId}</td>
                <td className="border p-2">{request.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RemovalRequestsPage