import { defineStore } from "pinia"
import { authService } from "~/services/api/auth"
import type { User, UserUpdate, UserRole } from "~/types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === "admin",
    isManager: (state) => state.user?.role === "admin" || state.user?.role === "manager",
    isOperator: (state) => ["admin", "manager", "operator"].includes(state.user?.role || ""),
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role as UserRole | undefined
  },

  actions: {
    async login(username: string, password: string) {
      try {
        const response = await authService.login(username, password)
        this.user = response.user
        this.isAuthenticated = true
        return response.user
      } catch (error: any) {
        console.error("Login error:", error)
        throw new Error(error?.data?.message || error?.message || "Login failed")
      }
    },

    async register(userData: {
      email: string
      username: string
      password: string
      role?: UserRole
    }) {
      try {
        const response = await authService.register(userData)
        this.user = response.user
        this.isAuthenticated = true
        return response.user
      } catch (error: any) {
        console.error("Registration error:", error)
        throw new Error(error?.data?.message || error?.message || "Registration failed")
      }
    },

    logout() {
      authService.logout().catch(() => {})
      this.user = null
      this.isAuthenticated = false
    },

    async checkAuth() {
      try {
        const user = await authService.getCurrentUser()
        this.user = user
        this.isAuthenticated = true
      } catch {
        this.user = null
        this.isAuthenticated = false
      }
    },

    async updateProfile(userData: UserUpdate) {
      if (!this.user) return
      const updatedUser = await authService.updateProfile(userData)
      this.user = updatedUser
      return updatedUser
    },

    hasRole(role: UserRole): boolean {
      return this.user?.role === role
    },

    hasAnyRole(roles: UserRole[]): boolean {
      return roles.includes(this.user?.role as UserRole)
    }
  }
})
