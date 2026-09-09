import ChatSpace from "@/components/chat/ChatSpace";

export default function ChatPage() {
  return (
    <main className="relative h-screen h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-[#fdf8fa] via-[#faedf3] to-[#f7e4ed] text-slate-900 flex flex-col font-sans">
      {/* GEOMETRIC DECORATIONS MATCHING LANDING PAGE */}
      <div className="pointer-events-none fixed -top-24 -left-24 h-96 w-96 rounded-full bg-rose-200/50 opacity-80 blur-3xl" />
      <div className="pointer-events-none fixed top-12 left-1/3 h-28 w-28 rounded-full bg-pink-300/40 blur-2xl" />
      <div className="pointer-events-none fixed bottom-10 right-10 h-96 w-96 rounded-full bg-rose-200/60 opacity-80 blur-3xl" />

      <ChatSpace />
    </main>
  );
}
