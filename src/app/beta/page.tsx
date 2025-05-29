// src/app/beta/page.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext"; // adapte selon ton projet
import Navbar from "../components/navcomp/Navbar";
import Footer from "../components/Footer";

export default function BugReportForm() {
  const { user } = useAuth(); // user.email est accessible
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) return setError("Erreur : vous devez être connecté");

    const res = await fetch("/api/beta/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        title,
        message,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setSubmitted(true);
    } else {
      setError(data.error?.detail || "Erreur lors de l'envoi.");
    }
  };

  return (
    <>
      <header className="bg-[#24292f] flex items-center justify-between p-4">
        <Navbar />
      </header>

      <main className="min-h-screen bg-[#0D1117] flex flex-col">
        <section className="bg-gray-900 text-white p-6 rounded-xl shadow-lg max-w-xl mx-auto mt-10">
          <h2 className="text-2xl font-bold mb-4">Signaler un bug 🐞</h2>
          <p className="mb-4 text-gray-300">
            Merci de nous aider à améliorer la plateforme !
          </p>

          {submitted ? (
            <div className="text-green-400">
              Merci ! Votre message a bien été envoyé. 💌
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Titre du bug"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600"
              />

              <textarea
                required
                placeholder="Détails du bug"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600"
              />

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 transition text-white font-semibold py-2 rounded"
              >
                Envoyer
              </button>

              {error && <p className="text-red-400">{error}</p>}
            </form>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
