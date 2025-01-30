// src/app/components/AdminPanel.tsx
'use client';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function AdminPanel() {
    const { user } = useAuth();
    const [userCount, setUserCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const baseUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:5000'
                    : 'https://lebaincode-backend.onrender.com';
                
                const response = await fetch(`${baseUrl}/api/admin/users/count`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user count');
                }

                const data = await response.json();
                setUserCount(data.count);
            } catch (error) {
                console.error('Error:', error);
                setError('Failed to load user count');
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchUserCount();
        }
    }, [user]);

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="bg-[#1F2937] rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Admin Control Panel</h2>
            <div className="bg-[#374151] rounded-lg p-4">
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
        </div>
    );
}