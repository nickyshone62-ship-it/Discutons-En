import PostDetail from "@/components/posts/PostDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#18030a] via-[#4c0519] to-[#881337] px-4 py-8 sm:px-6 lg:px-8 text-white font-sans overflow-x-hidden">
      {/* GEOMETRIC DECORATIONS */}
      <div className="pointer-events-none fixed -top-16 -left-16 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 right-10 h-80 w-80 rounded-full bg-rose-600/20 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 left-1/3 h-72 w-72 rounded-full bg-pink-600/15 blur-3xl" />

      <PostDetail postId={id} />
    </main>
  );
}

