import { useApi } from "~/composables/core/useApi";
import type {
  User,
  UserCreate,
  LoginCredentials,
  AuthResponse,
  UserUpdate,
} from "~/types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { fetch } = useApi();
    return await fetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  async register(data: UserCreate): Promise<User> {
    const { fetch } = useApi();
    return await fetch<User>("/auth/register", {
      method: "POST",
      body: data,
    });
  },

  async getCurrentUser(): Promise<User> {
    const { fetch } = useApi();
    return await fetch<User>("/users/me");
  },

  async updateProfile(data: UserUpdate): Promise<User> {
    const { fetch } = useApi();
    return await fetch<User>("/users/me", {
      method: "PUT",
      body: data,
    });
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const { fetch } = useApi();
    await fetch("/users/me/password", {
      method: "PUT",
      body: {
        current_password: currentPassword,
        new_password: newPassword,
      },
    });
  },
};

// Re-export types for backward compatibility
export type { User, UserCreate, LoginCredentials, AuthResponse };
