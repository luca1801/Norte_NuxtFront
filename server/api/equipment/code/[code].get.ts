import { proxyToBackend } from '../../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  
  if (!code) {
    throw createError({
      statusCode: 400,
      message: 'Equipment code is required'
    })
  }

  return proxyToBackend(event, `/equipment/code/${code}`, {
    cache: true,
    cacheMaxAge: 60,
    cacheKey: `equipment:code:${code}`
  })
})
