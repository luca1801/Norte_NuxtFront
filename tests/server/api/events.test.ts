import { describe, it, expect, beforeAll } from 'vitest'
import { $fetch } from 'ofetch'

const API_URL = 'http://localhost:3000'

describe('Events BFF Endpoints', () => {
  let authCookie: string

  beforeAll(async () => {
    const loginResponse = await $fetch.raw(`${API_URL}/api/auth/login`, {
      method: 'POST',
      body: { username: 'lucas', password: 'admin' }
    })
    const setCookie = loginResponse.headers.get('set-cookie')
    if (setCookie) {
      authCookie = setCookie.split(';')[0]
    }
  })

  describe('GET /api/events', () => {
    it('should return events list when authenticated', async () => {
      const response = await $fetch(`${API_URL}/api/events`, {
        headers: { cookie: authCookie }
      })
      expect(Array.isArray(response)).toBe(true)
    })
  })

  describe('GET /api/events/:id', () => {
    it('should return error for non-existent event', async () => {
      let threw = false
      try {
        await $fetch(`${API_URL}/api/events/00000000-0000-0000-0000-000000000000`, {
          headers: { cookie: authCookie }
        })
      } catch {
        threw = true
      }
      expect(threw).toBe(true)
    })
  })
})
