import { proxyToBackend } from '../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Equipment ID is required'
    })
  }

  const result = await proxyToBackend(event, `/equipment/${id}`, {
    method: 'PUT',
    body
  })

  
  return result
})
