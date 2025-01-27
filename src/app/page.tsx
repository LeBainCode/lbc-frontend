import Navbar from "./components/Navbar"
import Rules from "./components/Rules"
import AddOns from "./components/AddOns"
import Pricing from "./components/Pricing"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111827]">
      <Navbar />
      <div className="container mx-auto px-6 pt-32">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-bold text-white mb-6">
            Le Bain Code
          </h1>
          <p className="text-gray-400 text-base mb-8 max-w-md leading-relaxed">
            This is a paragraph with more information about something 
            important. This something has many uses and is made of 
            100% recycled material.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Email address"
              className="w-[240px] px-3 py-2 bg-gray-800 rounded text-sm border border-gray-700 focus:outline-none focus:border-gray-600"
            />
            <button className="bg-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-[#7C3AED] transition-colors whitespace-nowrap">
              Sign in through GitHub
            </button>
            <button className="bg-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 whitespace-nowrap">
              Organization Login
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>
      </div>
  
      <div className="container mx-auto px-6 mt-32 flex justify-center">
        <Rules />
      </div>

      <div className="container mx-auto px-6 mt-32 mb-20 flex justify-center">
        <AddOns />
      </div>

      <div className="container mx-auto px-6 mt-32 mb-20 flex justify-center">
        <Pricing />
      </div>

    </main>
  )
}