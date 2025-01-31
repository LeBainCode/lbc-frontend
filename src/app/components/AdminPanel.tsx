// src/app/components/AdminPanel.tsx
'use client';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

interface Prospect {
  email: string;
  type: 'individual' | 'organization' | 'other';
  reachedOut: boolean;
  comment: string;
  createdAt: Date;
}

export default function AdminPanel() {
    const { user } = useAuth();
    const [userCount, setUserCount] = useState<number | null>(null);
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:5000'
                    : 'https://lebaincode-backend.onrender.com';
                
                // Fetch user count
                const userResponse = await fetch(`${baseUrl}/api/admin/users/count`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Fetch prospects
                const prospectsResponse = await fetch(`${baseUrl}/api/admin/prospects`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!userResponse.ok || !prospectsResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const userData = await userResponse.json();
                const prospectsData = await prospectsResponse.json();

                setUserCount(userData.count);
                setProspects(prospectsData);
            } catch (error) {
                console.error('Error:', error);
                setError('Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const handleTypeChange = async (email: string, type: string) => {
        try {
            const baseUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:5000'
                : 'https://lebaincode-backend.onrender.com';
            
            const response = await fetch(`${baseUrl}/api/admin/prospects/${email}/type`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type })
            });

            if (!response.ok) {
                throw new Error('Failed to update prospect type');
            }

            setProspects(prospects.map(p => 
                p.email === email ? { ...p, type: type as 'individual' | 'organization' | 'other' } : p
            ));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleReachedOutChange = async (email: string, reachedOut: boolean) => {
        try {
            const baseUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:5000'
                : 'https://lebaincode-backend.onrender.com';
            
            const response = await fetch(`${baseUrl}/api/admin/prospects/${email}/reached-out`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reachedOut })
            });

            if (!response.ok) {
                throw new Error('Failed to update reached out status');
            }

            setProspects(prospects.map(p => 
                p.email === email ? { ...p, reachedOut } : p
            ));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCommentChange = async (email: string, comment: string) => {
        try {
            const baseUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:5000'
                : 'https://lebaincode-backend.onrender.com';
            
            const response = await fetch(`${baseUrl}/api/admin/prospects/${email}/comment`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comment })
            });

            if (!response.ok) {
                throw new Error('Failed to update comment');
            }

            setProspects(prospects.map(p => 
                p.email === email ? { ...p, comment } : p
            ));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filteredProspects = selectedType === 'all' 
        ? prospects 
        : prospects.filter(p => p.type === selectedType);

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="bg-[#1F2937] rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Admin Control Panel</h2>
            
            {/* User Count Section */}
            <div className="bg-[#374151] rounded-lg p-4 mb-6">
                {isLoading ? (
                    <p className="text-gray-400">Loading user count...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <div className="flex items-center space-x-2">
                        <span className="text-white">Total Standard Users:</span>
                        <span className="text-[#84cc16] font-bold text-xl">
                            {userCount}
                        </span>
                    </div>
                )}
            </div>

            {/* Prospects Table Section */}
            <div className="bg-[#374151] rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Prospects</h3>
                    <select 
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-[#1F2937] text-white px-3 py-2 rounded"
                    >
                        <option value="all">All Types</option>
                        <option value="individual">Individual</option>
                        <option value="organization">Organization</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-white">
                        <thead className="bg-[#1F2937] sticky top-0">
                            <tr>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Type</th>
                                <th className="p-3 text-left">Reached Out</th>
                                <th className="p-3 text-left">Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProspects.map((prospect) => (
                                <tr key={prospect.email} className="border-t border-gray-700">
                                    <td className="p-3">{prospect.email}</td>
                                    <td className="p-3">
                                        <select
                                            value={prospect.type}
                                            onChange={(e) => handleTypeChange(prospect.email, e.target.value)}
                                            className="bg-[#1F2937] text-white px-2 py-1 rounded"
                                        >
                                            <option value="individual">Individual</option>
                                            <option value="organization">Organization</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={prospect.reachedOut}
                                            onChange={(e) => handleReachedOutChange(prospect.email, e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-[#BF9ACA]"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="text"
                                            value={prospect.comment}
                                            onChange={(e) => handleCommentChange(prospect.email, e.target.value)}
                                            className="bg-[#1F2937] text-white px-2 py-1 rounded w-full"
                                            placeholder="Add a comment..."
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}