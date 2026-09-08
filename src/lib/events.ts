import { EventEmitter } from "events";

// Global singleton EventEmitter for real-time SSE stream events across HTTP handlers
class ChatEvents extends EventEmitter {}

// Prevent multiple event emitters in Next.js HMR development mode
const globalForChatEvents = globalThis as unknown as {
  chatEventEmitter?: ChatEvents;
};

export const chatEventEmitter =
  globalForChatEvents.chatEventEmitter ?? new ChatEvents();

if (process.env.NODE_ENV !== "production") {
  globalForChatEvents.chatEventEmitter = chatEventEmitter;
}

chatEventEmitter.setMaxListeners(200);
