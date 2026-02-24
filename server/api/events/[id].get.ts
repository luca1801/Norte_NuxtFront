import { proxyToBackend } from '../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Event ID is required'
    })
  }

  return proxyToBackend(event, `/events/${id}`, {
    cache: true,
    cacheMaxAge: 120,
    cacheKey: `events:id:${id}`
  })
})
