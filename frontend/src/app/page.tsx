import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AgentPay MVP
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Cross-Border Remittances
          </p>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Day 1: Foundation & Hedera Setup
            </h2>
            <div className="text-left space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Project scaffolding complete</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Hedera testnet accounts created</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Test stablecoin (TPYUSD) deployed</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>Ready for Day 2: Core Transaction Logic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
