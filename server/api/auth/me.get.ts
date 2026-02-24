import { getAuthToken, clearAuthCookie } from '../../utils/auth-cookies'
import { proxyToBackend } from '../../utils/api-proxy'
import { logger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const token = getAuthToken(event)
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated'
    })
  }

  try {
    const user = await proxyToBackend(event, '/users/me')
    logger.debug('Auth check successful', { userId: user.id })
    return { user }
  } catch (error: any) {
    if (error.statusCode === 401) {
      clearAuthCookie(event)
      logger.info('Auth check failed - cleared cookie')
    }
    throw error
  }
})
