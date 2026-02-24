import type { H3Event } from 'h3'

const COOKIE_NAME = 'auth_token'
const AUTH_CHECK_COOKIE = 'auth_check'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export function setAuthCookie(event: H3Event, token: string) {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  })
  setCookie(event, AUTH_CHECK_COOKIE, '1', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  })
}

export function getAuthToken(event: H3Event): string | undefined {
  return getCookie(event, COOKIE_NAME)
}

export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
  deleteCookie(event, AUTH_CHECK_COOKIE, { path: '/' })
}

export function hasAuthToken(event: H3Event): boolean {
  return !!getAuthToken(event)
}
