import SearchSpace from "@/components/search/SearchSpace";

export default function RecherchePage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-blue-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* GEOMETRIC DECORATIONS */}
      <div className="pointer-events-none fixed -top-16 -left-16 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 right-10 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />

      <SearchSpace />
    </main>
  );
}
