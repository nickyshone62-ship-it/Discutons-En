// Common TypeScript types for DIScutons-En

export interface User {
  id: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  createdAt: Date;
}

export interface AnonymousIdentity {
  id: string;
  userId: string;
  publicId: string; // e.g. Utilisateur #4821
  avatarUrl: string;
}
