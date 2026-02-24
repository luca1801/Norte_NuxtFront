import { proxyToBackend } from '../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Event ID is required'
    })
  }

  const body = await readBody(event)

  if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
    throw createError({
      statusCode: 400,
      message: 'Request body is required'
    })
  }

  const processedBody: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'start_date' || key === 'end_date') {
        const dateStr = String(value)
        processedBody[key] = dateStr.includes(':') && dateStr.split(':').length === 2
          ? dateStr + ':00'
          : dateStr
      } else {
        processedBody[key] = value
      }
    }
  }

  const result = await proxyToBackend(event, `/events/${id}`, {
    method: 'PUT',
    body: processedBody
  })

  
  return result
})
