import CreatePostForm from "@/components/posts/CreatePostForm";

export default function PublierPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#18030a] via-[#4c0519] to-[#881337] px-4 py-8 sm:px-6 lg:px-8">
      {/* GEOMETRIC DECORATIONS */}
      <div className="pointer-events-none fixed -top-16 -left-16 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 right-10 h-80 w-80 rounded-full bg-rose-600/20 blur-3xl" />

      <CreatePostForm />
    </main>
  );
}
