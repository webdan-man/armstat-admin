export type UserRole = "admin" | "editor";

export type AuthSession = {
  isAuthenticated: boolean;
  userId: string;
  role: UserRole;
  expiresAt: number;
};

export type LoginInput = {
  login: string;
  password: string;
};
