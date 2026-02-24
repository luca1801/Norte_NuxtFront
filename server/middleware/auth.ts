import { getAuthToken } from '../utils/auth-cookies'
import { logger } from '../utils/logger'

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout'
]

const ADMIN_PATHS = [
  '/api/users/',
  '/api/reports/audit-log'
]

const PUBLIC_USER_PATHS = [
  '/api/users/public'
]

export default defineEventHandler(async (event) => {
  const path = getRequestPath(event)

  if (PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'))) {
    return
  }

  if (!path.startsWith('/api/')) {
    return
  }

  const token = getAuthToken(event)

  if (!token) {
    logger.warn('Unauthorized access attempt', { path })
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  event.context.authToken = token

  if (PUBLIC_USER_PATHS.includes(path)) {
    return
  }

  if (ADMIN_PATHS.some(p => path.startsWith(p))) {
    const config = useRuntimeConfig(event)
    
    try {
      const user = await $fetch(`${config.backendUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (user.role !== 'admin') {
        logger.warn('Forbidden access attempt', { path, userId: user.id, role: user.role })
        throw createError({
          statusCode: 403,
          message: 'Admin access required'
        })
      }
      
      event.context.user = user
      logger.debug('Admin access granted', { path, userId: user.id })
    } catch (error: any) {
      if (error.statusCode) throw error
      throw createError({
        statusCode: 401,
        message: 'Invalid token'
      })
    }
  }
})
