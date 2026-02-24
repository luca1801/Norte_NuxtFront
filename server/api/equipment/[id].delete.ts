import { proxyToBackend } from '../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Equipment ID is required'
    })
  }

  await proxyToBackend(event, `/equipment/${id}`, {
    method: 'DELETE'
  })

  
  return { success: true }
})
