// src/app/components/dashboardcomp/admin/BetaUsersTable.tsx

import { useState, useEffect } from "react";
import { CheckCircleIcon, XCircleIcon, EnvelopeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Efficient debug utility
const debugBeta = (() => {
  const seenMessages = new Set<string>();
  let lastLog = 0;
  const MIN_LOG_INTERVAL = 1000; // ms between similar logs
  
  return (message: string, data?: unknown, isError = false) => {
    if (process.env.NODE_ENV !== "development") return;
    
    const now = Date.now();
    const key = `${message}:${JSON.stringify(data || '')}`;
    
    if (seenMessages.has(key) && now - lastLog < MIN_LOG_INTERVAL) return;
    seenMessages.add(key);
    lastLog = now;
    
    if (seenMessages.size > 30) {
      seenMessages.clear();
    }
    
    if (isError) {
      console.error(`[BetaUsersTable] ${message}`, data || '');
    } else {
      console.log(`[BetaUsersTable] ${message}`, data || '');
    }
  };
})();

// Interface for beta application
interface BetaApplication {
  _id: string;
  userId: string;
  username: string;
  email: string;
  reason: string;
  occupation: string;
  discordId?: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  decidedAt?: string;
}

interface BetaUsersTableProps {
  applications?: BetaApplication[] | null;
  isLoading: boolean;
  error: string | null;
  onApprove: (applicationId: string, userId: string, email: string) => Promise<void>;
  onReject: (applicationId: string, userId: string, email: string) => Promise<void>;
  refreshData: () => void;
}

export default function BetaUsersTable({
  applications = [],
  isLoading,
  error,
  onApprove,
  onReject,
  refreshData
}: BetaUsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [expandedReason, setExpandedReason] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Fix: Ensure applications is always an array
  const safeApplications: BetaApplication[] = Array.isArray(applications) ? applications : [];

  // Filter applications by search term and filter status
  const filteredApplications = safeApplications
    .filter(app => 
      searchTerm ? 
        app.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) : 
        true
    )
    .filter(app => filter === 'all' ? true : app.status === filter)
    .sort((a, b) => {
      // Sort pending applications first, then most recent
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    });

  // Count applications by status - Fixed to use safeApplications
  const counts = {
    all: safeApplications.length,
    pending: safeApplications.filter(app => app.status === 'pending').length,
    approved: safeApplications.filter(app => app.status === 'approved').length,
    rejected: safeApplications.filter(app => app.status === 'rejected').length
  };

  const handleApprove = async (application: BetaApplication) => {
    try {
      setProcessingIds(prev => new Set(prev).add(application._id));
      debugBeta("Approving beta application", { userId: application.userId, email: application.email });
      await onApprove(application._id, application.userId, application.email);
      refreshData();
    } catch (error) {
      debugBeta("Failed to approve beta application", error, true);
    } finally {
      setProcessingIds(prev => {
        const updated = new Set(prev);
        updated.delete(application._id);
        return updated;
      });
    }
  };

  const handleReject = async (application: BetaApplication) => {
    try {
      setProcessingIds(prev => new Set(prev).add(application._id));
      debugBeta("Rejecting beta application", { userId: application.userId, email: application.email });
      await onReject(application._id, application.userId, application.email);
      refreshData();
    } catch (error) {
      debugBeta("Failed to reject beta application", error, true);
    } finally {
      setProcessingIds(prev => {
        const updated = new Set(prev);
        updated.delete(application._id);
        return updated;
      });
    }
  };

  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Toggle expanded reason view
  const toggleReason = (applicationId: string) => {
    setExpandedReason(expandedReason === applicationId ? null : applicationId);
  };

  return (
    <div className="bg-[#374151] rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h3 className="text-xl font-bold text-white">Beta Applications</h3>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1F2937] text-white pl-9 pr-4 py-2 rounded w-full md:w-64"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-2 top-2.5" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-2.5"
              >
                <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              </button>
            )}
          </div>
          
          {/* Status filter dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-[#1F2937] text-white px-3 py-2 rounded"
          >
            <option value="all">All Status ({counts.all})</option>
            <option value="pending">Pending ({counts.pending})</option>
            <option value="approved">Approved ({counts.approved})</option>
            <option value="rejected">Rejected ({counts.rejected})</option>
          </select>
          
          {/* Refresh button */}
          <button 
            onClick={refreshData}
            className="bg-[#1F2937] text-white px-3 py-2 rounded hover:bg-[#374151]"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BF9ACA]"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-[#BF9ACA] text-white rounded hover:bg-[#A47BB5]"
          >
            Try Again
          </button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          No beta applications found matching your criteria
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-white">
            <thead className="bg-[#1F2937] sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Applied On</th>
                <th className="p-3 text-left">Occupation</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr 
                  key={application._id}
                  className={`border-t border-gray-700 hover:bg-[#2C3B4E] transition-colors ${
                    application.status === 'pending' ? 'bg-blue-900/10' : 
                    application.status === 'approved' ? 'bg-green-900/10' : 
                    application.status === 'rejected' ? 'bg-red-900/10' : ''
                  }`}
                >
                  <td className="p-3">{application.username}</td>
                  <td className="p-3">{application.email}</td>
                  <td className="p-3">{formatDate(application.appliedAt)}</td>
                  <td className="p-3">{application.occupation}</td>
                  <td className="p-3">
                    <div>
                      <div 
                        className={`${application.reason && application.reason.length > 50 && expandedReason !== application._id
                          ? 'line-clamp-2' 
                          : ''
                        } text-sm`}
                      >
                        {application.reason || "No reason provided"}
                      </div>
                      {application.reason && application.reason.length > 50 && (
                        <button 
                          onClick={() => toggleReason(application._id)}
                          className="text-xs text-indigo-400 mt-1 hover:text-indigo-300"
                        >
                          {expandedReason === application._id ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      application.status === 'pending' ? 'bg-blue-900/30 text-blue-300' :
                      application.status === 'approved' ? 'bg-green-900/30 text-green-300' :
                      'bg-red-900/30 text-red-300'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    {application.decidedAt && (
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(application.decidedAt)}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      {application.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprove(application)}
                            disabled={processingIds.has(application._id)}
                            className="p-1 bg-green-800/30 hover:bg-green-700/40 text-green-300 rounded flex items-center disabled:opacity-50"
                            title="Approve"
                          >
                            {processingIds.has(application._id) ? (
                              <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-green-300 rounded-full"></div>
                            ) : (
                              <>
                                <CheckCircleIcon className="h-4 w-4" />
                                <span className="ml-1 text-xs">Approve</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(application)}
                            disabled={processingIds.has(application._id)}
                            className="p-1 bg-red-800/30 hover:bg-red-700/40 text-red-300 rounded flex items-center disabled:opacity-50"
                            title="Reject"
                          >
                            {processingIds.has(application._id) ? (
                              <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-red-300 rounded-full"></div>
                            ) : (
                              <>
                                <XCircleIcon className="h-4 w-4" />
                                <span className="ml-1 text-xs">Reject</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => window.open(`mailto:${application.email}`)}
                          className="p-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded flex items-center"
                          title="Send Email"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                          <span className="ml-1 text-xs">Contact</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Application statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1F2937] p-4 rounded-lg">
          <h4 className="text-sm text-gray-400 mb-1">Pending Applications</h4>
          <p className="text-2xl font-bold text-blue-400">{counts.pending}</p>
        </div>
        <div className="bg-[#1F2937] p-4 rounded-lg">
          <h4 className="text-sm text-gray-400 mb-1">Approval Rate</h4>
          <p className="text-2xl font-bold text-green-400">
            {counts.approved + counts.rejected > 0 ? 
              `${Math.round((counts.approved / (counts.approved + counts.rejected)) * 100)}%` : 
              "N/A"}
          </p>
        </div>
        <div className="bg-[#1F2937] p-4 rounded-lg">
          <h4 className="text-sm text-gray-400 mb-1">Latest Activity</h4>
          <p className="text-lg text-gray-300">
            {safeApplications.length > 0 ? 
              formatDate(
                safeApplications.sort((a, b) => 
                  new Date(b.decidedAt || b.appliedAt).getTime() - 
                  new Date(a.decidedAt || a.appliedAt).getTime()
                )[0].decidedAt || safeApplications[0].appliedAt
              ) : 
              "No activity"
            }
          </p>
        </div>
      </div>
    </div>
  );
}
