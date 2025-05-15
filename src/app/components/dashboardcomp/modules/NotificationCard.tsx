// components/modules/NotificationCard.tsx
"use client";

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
  onAction,
}: NotificationCardProps) {
  return (
    <div className="flex flex-col bg-[#000000] w-[300px] h-[200px] rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col mt-auto">
          <h3 className="text-white text-xl font-medium">{title}</h3>
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>

        <button className="text-gray-400 hover:text-gray-300">×</button>
      </div>

      <button
        onClick={onAction}
        className="w-full bg-[#374151] border-2 border-[#e6e6e6] opacity-70 text-[#e6e6e6] py-2 rounded text-sm mt-auto"
      >
        {actionLabel}
      </button>
    </div>
  );
}
