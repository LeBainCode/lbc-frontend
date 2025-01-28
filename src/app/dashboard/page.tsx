// app/dashboard/page.tsx
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Link from "next/link"
import Stats from "../components/Stats"
import Modules from "../components/Modules"

export default function Dashboard() {
    // TODO: User data will be fetched from backend
    const userData = {
        id: "001", // This will be dynamic based on logged in user
        stats: {
            hoursCoding: 6,
            exercises: "15+",
            notionsMastered: 3,
            daysLeft: 25
        }
    }

    return (
        <>
        <main className="min-h-screen bg-[#111827]">
            <Navbar />
            <div className="container mx-auto px-6 pt-32">
                <div className="mb-1">
                    <h1 className="text-6xl font-bold text-white">
                        Hello #{userData.id}
                    </h1>
                    <Link 
                        href="/settings" 
                        className="text-[#84cc16] text-sm hover:underline"
                    >
                        Settings
                    </Link>
                </div>
                
                <div className="mt-12">
                    <h2 className="text-white text-2xl font-medium mb-6">
                        Statistiques
                    </h2>
                    <Stats userStats={userData.stats} />
                </div>

                <div className="mt-12">
                    <Modules />
                </div>
            </div>
        </main>
        <Footer />
        </>
    )
}