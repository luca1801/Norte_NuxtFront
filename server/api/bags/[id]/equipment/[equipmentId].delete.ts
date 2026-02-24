import { proxyToBackend } from '../../../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const bagId = getRouterParam(event, 'id')
  const equipmentId = getRouterParam(event, 'equipmentId')
  
  const result = await proxyToBackend(event, `/bags/${bagId}/equipment/${equipmentId}`, {
    method: 'DELETE'
  })

  
  return result
})
