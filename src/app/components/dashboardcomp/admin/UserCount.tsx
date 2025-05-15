interface UserCountProps {
    count: number | null;
    isLoading: boolean;
    error: string | null;
}

export default function UserCount({ count, isLoading, error }: UserCountProps) {
    return (
        <div className="bg-[#374151] rounded-lg p-4 mb-6">
            {isLoading ? (
                <p className="text-gray-400">Loading user count...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="flex items-center space-x-2">
                    <span className="text-white">Total Standard Users:</span>
                    <span className="text-[#84cc16] font-bold text-xl">
                        {count}
                    </span>
                </div>
            )}
        </div>
    );
}