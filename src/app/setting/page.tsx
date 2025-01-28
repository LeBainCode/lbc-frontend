import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Settings() {
  return (
    <>
      <main className="min-h-screen bg-[#0D1117]">
        <Navbar />
        <div className="container mx-auto px-6 pt-32">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold text-white mb-6">Settings</h1>
            <div className="flex gap-3"></div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
