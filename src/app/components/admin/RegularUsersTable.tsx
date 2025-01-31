// src/app/components/admin/RegularUsersTable.tsx

import { RegularUser } from "@/app/types/admin";

interface RegularUsersTableProps {
    users: RegularUser[];
    showNoEmail: boolean;
    onShowNoEmailChange: (value: boolean) => void;
}

export default function RegularUsersTable({ users, showNoEmail, onShowNoEmailChange }: RegularUsersTableProps) {
    const usersWithEmail = users.filter(user => user.email);
    const usersWithoutEmail = users.filter(user => !user.email);
    const filteredUsers = showNoEmail ? usersWithoutEmail : users;
    
    // Calculate conversion rate
    const conversionRate = users.length > 0 
        ? ((usersWithEmail.length / users.length) * 100).toFixed(1)
        : 0;

    return (
        <div className="bg-[#374151] rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">Regular Users</h3>
                    <div className="mt-2 flex space-x-4 text-sm">
                        <span className="text-gray-300">
                            Total: <span className="text-white font-semibold">{users.length}</span>
                        </span>
                        <span className="text-gray-300">
                            With Email: <span className="text-green-400 font-semibold">{usersWithEmail.length}</span>
                        </span>
                        <span className="text-gray-300">
                            Without Email: <span className="text-red-400 font-semibold">{usersWithoutEmail.length}</span>
                        </span>
                        <span className="text-gray-300">
                            Conversion Rate: <span className="text-[#BF9ACA] font-semibold">{conversionRate}%</span>
                        </span>
                    </div>
                </div>
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
                {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        No regular users found
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        No users {showNoEmail ? 'without email' : ''} found
                    </div>
                ) : (
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
                                <tr key={regularUser._id} className="border-t border-gray-700 hover:bg-[#2C3B4E] transition-colors">
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
                )}
            </div>
        </div>
    );
}