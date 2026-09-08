import { getCurrentUser } from "@/lib/auth";
import { chatEventEmitter } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial heartbeat
      controller.enqueue(encoder.encode(": connected\n\n"));

      const onNewMessage = (message: any) => {
        try {
          const data = `data: ${JSON.stringify(message)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (e) {
          console.error("[SSE] Enqueue error:", e);
        }
      };

      chatEventEmitter.on("new_chat_message", onNewMessage);

      // Heartbeat interval to keep connection alive over proxies
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        chatEventEmitter.off("new_chat_message", onNewMessage);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
