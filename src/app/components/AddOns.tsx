export default function AddOns() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8">Additional add-ons</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#e6e6e6] rounded-lg p-6">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0969da]">
            ⚡
          </div>

          <h3 className="text-[#24292F] font-medium mb-2">Title Title</h3>
          <p className="text-[#57606A] text-sm mb-4">
            Starting at $15/month after a 60 day trial
          </p>
          <button className="text-[#24292F] text-sm hover:text-white flex items-center">
            Compare plans
            <span className="ml-1">→</span>
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-[#e6e6e6] rounded-lg p-6">
          <div className="text-purple-400 mb-4">🔮</div>
          <h3 className="text-[#24292F] font-medium mb-2">Title</h3>
          <p className="text-[#57606A] text-sm mb-4">
            Starting at $5.19 per hour of compute and $0.17 per GB of storage
          </p>
          <button className="text-[#24292F] text-sm hover:text-white flex items-center">
            Learn more
            <span className="ml-1">→</span>
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-[#e6e6e6] rounded-lg p-6">
          <div className="text-yellow-400 mb-4">📦</div>
          <h3 className="text-[#24292F] font-medium mb-2">Title</h3>
          <p className="text-[#57606A] text-sm mb-4">
            $5 per month for 50 GB bandwidth and 50 GB of storage
          </p>
          <button className="text-[#24292F] text-sm hover:text-white flex items-center">
            Learn more
            <span className="ml-1">→</span>
          </button>
        </div>

        {/* Card 4 */}
        <div className="bg-[#e6e6e6] rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="text-green-400">🎯</div>
            <span className="text-xs text-gray-600 bg-gray-700 px-2 py-1 rounded">
              Compare Only
            </span>
          </div>
          <h3 className="text-[#24292F] font-medium mb-2">Title</h3>
          <p className="text-[#57606A] text-sm mb-4">
            $49 per month per active committer
          </p>
          <button className="text-[#24292F] text-sm hover:text-white flex items-center">
            Learn more
            <span className="ml-1">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
