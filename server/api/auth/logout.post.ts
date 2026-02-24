import { clearAuthCookie } from '../../utils/auth-cookies'
import { logger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  logger.info('Logout')
  clearAuthCookie(event)
  return { success: true }
})
