import PropTypes from "prop-types"

const OrganizationTable = ({ organizations }) => {
    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            #
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Organization Name
                        </th>
                        {/* Uncomment the following line if you want to add an Actions column */}
                        {/* <th scope="col" className="px-6 py-3">Actions</th> */}
                    </tr>
                </thead>
                <tbody>
                    {organizations.length > 0 ? (
                        organizations.map((org, index) => (
                            <tr
                                key={org._id}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{org.name}</td>
                                {/* Uncomment the following block if you want to add a Delete button */}
                                {/*
                <td className="px-6 py-4">
                  <button className="font-medium text-red-600 dark:text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
                */}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                No organizations found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

OrganizationTable.propTypes = {
    organizations: PropTypes.array.isRequired,
}

export default OrganizationTable

