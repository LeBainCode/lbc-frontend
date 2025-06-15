// /src/app/components/dashboardcomp/admin/ProspectsTable.tsx

import { Prospect } from "@/app/types/admin";
import { useState, useRef } from "react";
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline";

// Efficient debug utility
const debugProspects = (() => {
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
      console.error(`[ProspectsTable] ${message}`, data || '');
    } else {
      console.log(`[ProspectsTable] ${message}`, data || '');
    }
  };
})();

interface ProspectsTableProps {
  prospects: Prospect[];
  selectedType: string;
  onTypeChange: (email: string, type: string) => void;
  onReachedOutChange: (email: string, reachedOut: boolean) => void;
  onCommentChange: (email: string, comment: string) => void;
  onFilterChange: (type: string) => void;
  setSelectedType: (type: string) => void;
  showNoEmail: boolean;
  setShowNoEmail: (show: boolean) => void;
}

export default function ProspectsTable({
  prospects,
  selectedType,
  onTypeChange,
  onReachedOutChange,
  onCommentChange,
  onFilterChange,
  setSelectedType,
  showNoEmail,
  setShowNoEmail,
}: ProspectsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const commentRefs = useRef<{[key: string]: HTMLTextAreaElement | null}>({});
  
  // Filter prospects by type and search term
  const filteredProspects = prospects
    .filter((prospect) => 
      selectedType === "all" ? true : prospect.type === selectedType)
    .filter((prospect) => 
      searchTerm ? prospect.email.toLowerCase().includes(searchTerm.toLowerCase()) : true);

  // Format timestamp for display
  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  // Toggle comment expansion
  const toggleCommentExpand = (email: string) => {
    const newExpandedComments = new Set(expandedComments);
    if (newExpandedComments.has(email)) {
      newExpandedComments.delete(email);
    } else {
      newExpandedComments.add(email);
    }
    setExpandedComments(newExpandedComments);
    
    // Auto-focus textarea when expanded
    setTimeout(() => {
      if (commentRefs.current[email]) {
        commentRefs.current[email]?.focus();
      }
    }, 0);
  };
  
  // Auto-resize textarea based on content
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  debugProspects("Rendering prospects table", { 
    totalProspects: prospects.length,
    filteredCount: filteredProspects.length, 
    selectedType 
  });

  return (
    <div className="bg-[#374151] rounded-lg p-4">
      {/* Header with search and filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h3 className="text-xl font-bold text-white">Prospects</h3>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search emails..."
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
          
          {/* Type filter dropdown */}
          <select
            value={selectedType}
            onChange={(e) => onFilterChange(e.target.value)}
            className="bg-[#1F2937] text-white px-3 py-2 rounded"
          >
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="organization">Organization</option>
            <option value="bot">Bot</option>
            <option value="spam">Spam</option>
            <option value="developmentTest">Development Test</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      {/* Prospects count */}
      <div className="mb-2 text-sm text-gray-400">
        Showing {filteredProspects.length} of {prospects.length} prospects
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-white">
          <thead className="bg-[#1F2937] sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Reached Out</th>
              <th className="p-3 text-left">Comment</th>
            </tr>
          </thead>
          <tbody>
            {filteredProspects.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  No prospects found matching your criteria
                </td>
              </tr>
            ) : (
              filteredProspects.map((prospect, index) => (
                <tr
                  key={`${prospect.email}-${index}`}
                  className="border-t border-gray-700 hover:bg-[#2C3B4E] transition-colors"
                >
                  <td className="p-3">{prospect.email}</td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <select
                        value={prospect.type}
                        onChange={(e) =>
                          onTypeChange(prospect.email, e.target.value)
                        }
                        className="bg-[#1F2937] text-white px-2 py-1 rounded w-full"
                      >
                        <option value="individual">Individual</option>
                        <option value="organization">Organization</option>
                        <option value="bot">Bot</option>
                        <option value="spam">Spam</option>
                        <option value="developmentTest">Development Test</option>
                        <option value="other">Other</option>
                      </select>
                      {prospect.lastUpdatedBy?.type && (
                        <div className="text-xs text-gray-400">
                          Updated by {prospect.lastUpdatedBy.type.admin}
                          <br />
                          {formatTimestamp(prospect.lastUpdatedBy.type.timestamp)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <input
                        type="checkbox"
                        checked={prospect.reachedOut}
                        onChange={(e) =>
                          onReachedOutChange(prospect.email, e.target.checked)
                        }
                        className="form-checkbox h-5 w-5 text-[#BF9ACA]"
                      />
                      {prospect.lastUpdatedBy?.reachedOut && (
                        <div className="text-xs text-gray-400">
                          Updated by {prospect.lastUpdatedBy.reachedOut.admin}
                          <br />
                          {formatTimestamp(
                            prospect.lastUpdatedBy.reachedOut.timestamp
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 w-1/3">
                    <div className="space-y-1">
                      {/* Expandable comment textarea - FIXED REF TYPE ERROR */}
                      <div className={`bg-[#1F2937] rounded transition-all duration-200 ${
                        expandedComments.has(prospect.email) ? 'p-2' : ''
                      }`}>
                        <textarea
                          // Fixed ref callback to not return a value
                          ref={(el) => {
                            commentRefs.current[prospect.email] = el;
                          }}
                          value={prospect.comment || ""}
                          onChange={(e) => {
                            onCommentChange(prospect.email, e.target.value);
                            handleTextareaInput(e);
                          }}
                          onFocus={() => {
                            if (!expandedComments.has(prospect.email)) {
                              toggleCommentExpand(prospect.email);
                            }
                          }}
                          onClick={() => {
                            if (!expandedComments.has(prospect.email)) {
                              toggleCommentExpand(prospect.email);
                            }
                          }}
                          onInput={handleTextareaInput}
                          className={`w-full bg-transparent text-white resize-none overflow-auto focus:outline-none focus:ring-1 focus:ring-[#BF9ACA] ${
                            expandedComments.has(prospect.email) ? 'min-h-[80px]' : 'h-8 px-2 py-1'
                          }`}
                          placeholder={expandedComments.has(prospect.email) ? "Add detailed notes here..." : "Add a comment..."}
                          style={expandedComments.has(prospect.email) ? { height: 'auto', minHeight: '80px' } : {}}
                        />
                        
                        {/* Collapse/expand toggle button */}
                        {prospect.comment && (
                          <div className="flex justify-end mt-1">
                            <button 
                              onClick={() => toggleCommentExpand(prospect.email)}
                              className="text-xs text-gray-400 hover:text-gray-300"
                            >
                              {expandedComments.has(prospect.email) ? "Collapse" : "Expand"}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Last updated info */}
                      {prospect.lastUpdatedBy?.comment && (
                        <div className="text-xs text-gray-400">
                          Updated by {prospect.lastUpdatedBy.comment.admin}
                          <br />
                          {formatTimestamp(
                            prospect.lastUpdatedBy.comment.timestamp
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
