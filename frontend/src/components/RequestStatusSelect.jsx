import { useState } from 'react';

const RequestStatusSelect = ({ request, handleStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(request.status);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsOpen(true); 
    }, 300);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    // Clear the timeout if the mouse leaves before the delay completes
    clearTimeout(timeoutId);
    setTimeoutId(null);

    const id = setTimeout(() => {
      setIsOpen(false);
    }, 200);
    setTimeoutId(id);
  };

  const handleOptionClick = (status) => {
    setSelectedOption(status);
    handleStatusChange(request._id, status);
    setIsOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'approved':
        return 'bg-green-500 hover:bg-green-600';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-200 hover:bg-gray-300';
    }
  };

  return (
    <div 
      className="relative" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave} // Close dropdown when leaving the entire container
    >
    <div className="relative">
      {/* Trigger button */}
      <div
        className={`border p-2 transition-all rounded-xl w-[5rem] cursor-pointer ${getStatusColor(selectedOption)} text-center text-sm text-white`}
      >
        {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}
      </div>

      {/* Dropdown options */}
      {isOpen && (
        <div
          className="transition-all absolute bg-opacity-0 z-10 text-center text-sm text-white flex-col flex gap-y-1 w-[5rem]"
        >
          <div
            className={`mt-1 p-2 cursor-pointer rounded-xl ${getStatusColor('pending')}`}
            onClick={() => handleOptionClick('pending')}
          >
            Pending
          </div>
          <div
            className={`p-2 cursor-pointer rounded-xl  ${getStatusColor('approved')}`}
            onClick={() => handleOptionClick('approved')}
          >
            Approved
          </div>
          <div
            className={`p-2 cursor-pointer rounded-xl  ${getStatusColor('rejected')}`}
            onClick={() => handleOptionClick('rejected')}
          >
            Rejected
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default RequestStatusSelect;