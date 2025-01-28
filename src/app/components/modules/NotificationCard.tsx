// components/modules/NotificationCard.tsx
"use client"

interface NotificationCardProps {
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
}

export default function NotificationCard({ 
    title, 
    description, 
    actionLabel, 
    onAction 
}: NotificationCardProps) {
    return (
        <div className="bg-[#111827] rounded-lg p-6 border border-gray-800">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-white text-xl font-medium">{title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{description}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-300">
                    ×
                </button>
            </div>
            <button 
                onClick={onAction}
                className="w-full bg-[#1F2937] text-white py-2 rounded text-sm hover:bg-gray-700"
            >
                {actionLabel}
            </button>
        </div>
    )
}
