import { proxyToBackend } from '../../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  
  if (!code) {
    throw createError({
      statusCode: 400,
      message: 'Event code is required'
    })
  }

  return proxyToBackend(event, `/events/code/${code}`, {
    cache: true,
    cacheMaxAge: 60,
    cacheKey: `events:code:${code}`
  })
})
