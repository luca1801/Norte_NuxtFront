import { proxyToBackend } from '../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  return proxyToBackend(event, `/reservations/${id}`, {
    cache: false
  })
})
