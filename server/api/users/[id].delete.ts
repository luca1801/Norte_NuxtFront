import { proxyToBackend } from '../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const result = await proxyToBackend(event, `/users/${id}`, {
    method: 'DELETE'
  })

  
  return result
})
