import { defineStore } from "pinia";
import { authService } from "~/services/api/auth";
import type { User, UserUpdate, UserRole } from "~/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // Inicia como true para evitar flash de conteúdo
  }),

  getters: {
    isAdmin: (state) => state.user?.role === "admin",
    isManager: (state) =>
      state.user?.role === "admin" || state.user?.role === "manager",
    isOperator: (state) =>
      state.user?.role === "admin" ||
      state.user?.role === "manager" ||
      state.user?.role === "operator",
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role as UserRole | undefined,
  },

  actions: {
    async login(username: string, password: string) {
      try {
        const response = await authService.login({ username, password });
        this.token = response.access_token;
        this.isAuthenticated = true;

        // Get user profile
        const user = await authService.getCurrentUser();
        this.user = user;

        // Save to localStorage
        if (import.meta.client) {
          localStorage.setItem("auth_token", response.access_token);
          localStorage.setItem("auth_user", JSON.stringify(user));
        }

        return user;
      } catch (error: any) {
        console.error("Login error:", error);
        throw new Error(error?.data?.detail || "Login failed");
      }
    },

    async register(userData: {
      email: string;
      username: string;
      password: string;
      role?: UserRole;
    }) {
      try {
        await authService.register(userData);

        // Auto login after registration
        return await this.login(userData.username, userData.password);
      } catch (error: any) {
        console.error("Registration error:", error);
        throw new Error(error?.data?.detail || "Registration failed");
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;

      if (import.meta.client) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    },

    async checkAuth() {
      if (import.meta.client) {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("auth_user");

        if (token && userStr) {
          try {
            this.user = JSON.parse(userStr);
            this.token = token;
            this.isAuthenticated = true;

            // Validate token by fetching current user
            try {
              const user = await authService.getCurrentUser();
              this.user = user;
              localStorage.setItem("auth_user", JSON.stringify(user));
            } catch {
              // Token invalid, logout
              this.logout();
            }
          } catch (error) {
            this.logout();
          }
        }
      }
    },

    async updateProfile(userData: UserUpdate) {
      if (!this.user) return;

      try {
        const updatedUser = await authService.updateProfile(userData);
        this.user = updatedUser;

        if (import.meta.client) {
          localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        }

        return updatedUser;
      } catch (error: any) {
        console.error("Update profile error:", error);
        throw new Error(error?.data?.detail || "Update failed");
      }
    },

    hasRole(role: UserRole): boolean {
      return this.user?.role === role;
    },

    hasAnyRole(roles: UserRole[]): boolean {
      return roles.includes(this.user?.role as UserRole);
    },
  },
});
