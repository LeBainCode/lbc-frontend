import { Prospect } from "@/app/types/admin";
// import { useAuth } from "@/app/context/AuthContext";

interface ProspectsTableProps {
  prospects: Prospect[];
  selectedType: string;
  onTypeChange: (email: string, type: string) => void;
  onReachedOutChange: (email: string, reachedOut: boolean) => void;
  onCommentChange: (email: string, comment: string) => void;
  onFilterChange: (type: string) => void;
}

export default function ProspectsTable({
  prospects,
  selectedType,
  onTypeChange,
  onReachedOutChange,
  onCommentChange,
  onFilterChange,
}: ProspectsTableProps) {
  const filteredProspects =
    selectedType === "all"
      ? prospects
      : prospects.filter((p) => p.type === selectedType);

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="bg-[#374151] rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Prospects</h3>
        <select
          value={selectedType}
          onChange={(e) => onFilterChange(e.target.value)}
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
            {filteredProspects.map((prospect, index) => (
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
                <td className="p-3">
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={prospect.comment}
                      onChange={(e) =>
                        onCommentChange(prospect.email, e.target.value)
                      }
                      className="bg-[#1F2937] text-white px-2 py-1 rounded w-full"
                      placeholder="Add a comment..."
                    />
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
