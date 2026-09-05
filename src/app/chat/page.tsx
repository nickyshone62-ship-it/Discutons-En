import ChatSpace from "@/components/chat/ChatSpace";

export default function ChatPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-blue-950">
      {/* GEOMETRIC DECORATIONS */}
      <div className="pointer-events-none fixed -top-16 -left-16 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 right-10 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />

      <ChatSpace />
    </main>
  );
}
