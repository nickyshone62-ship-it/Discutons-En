import ChatSpace from "@/components/chat/ChatSpace";

export default function ChatPage() {
  return (
    <main className="relative h-screen h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-[#18030a] via-[#4c0519] to-[#881337] flex flex-col">
      {/* GEOMETRIC DECORATIONS */}
      <div className="pointer-events-none fixed -top-16 -left-16 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 right-10 h-80 w-80 rounded-full bg-rose-600/20 blur-3xl" />

      <ChatSpace />
    </main>
  );
}

