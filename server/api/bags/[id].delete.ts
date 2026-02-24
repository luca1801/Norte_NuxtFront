import { proxyToBackend } from '../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const result = await proxyToBackend(event, `/bags/${id}`, {
    method: 'DELETE'
  })

  
  return result
})
