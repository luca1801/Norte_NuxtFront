import { describe, it, expect, beforeEach } from 'vitest'
import { $fetch } from 'ofetch'

const API_URL = 'http://localhost:3000'
const BACKEND_URL = 'http://localhost:8000'

describe('Auth BFF Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('should return 400 for invalid input', async () => {
      try {
        await $fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          body: { username: 'ab', password: 'short' }
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response?.status).toBe(400)
      }
    })

    it('should return 401 for invalid credentials', async () => {
      try {
        await $fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          body: { username: 'nonexistent', password: 'wrongpassword123' }
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response?.status).toBe(401)
      }
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return 401 when not authenticated', async () => {
      try {
        await $fetch(`${API_URL}/api/auth/me`)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response?.status).toBe(401)
      }
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should always succeed', async () => {
      const response = await $fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST'
      })
      expect(response).toEqual({ success: true })
    })
  })
})
