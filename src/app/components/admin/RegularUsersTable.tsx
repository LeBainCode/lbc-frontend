import { RegularUser } from "@/app/types/admin";

interface RegularUsersTableProps {
    users: RegularUser[];
    showNoEmail: boolean;
    onShowNoEmailChange: (value: boolean) => void;
}

export default function RegularUsersTable({ users, showNoEmail, onShowNoEmailChange }: RegularUsersTableProps) {
    const filteredUsers = showNoEmail ? users.filter(user => !user.email) : users;

    return (
        <div className="bg-[#374151] rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Regular Users</h3>
                <div className="flex items-center space-x-4">
                    <label className="text-white text-sm flex items-center">
                        <input
                            type="checkbox"
                            checked={showNoEmail}
                            onChange={(e) => onShowNoEmailChange(e.target.checked)}
                            className="mr-2"
                        />
                        Show only users without email
                    </label>
                </div>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-white">
                    <thead className="bg-[#1F2937] sticky top-0">
                        <tr>
                            <th className="p-3 text-left">Username</th>
                            <th className="p-3 text-left">Email Status</th>
                            <th className="p-3 text-left">Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((regularUser) => (
                            <tr key={regularUser._id} className="border-t border-gray-700">
                                <td className="p-3">{regularUser.username}</td>
                                <td className="p-3">
                                    {regularUser.email ? (
                                        <span className="text-green-400">{regularUser.email}</span>
                                    ) : (
                                        <span className="text-red-400">No email</span>
                                    )}
                                </td>
                                <td className="p-3">
                                    {new Date(regularUser.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}