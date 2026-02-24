import { proxyToBackend } from '../../../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const bagId = getRouterParam(event, 'id')
  const equipmentCode = getRouterParam(event, 'code')
  
  const result = await proxyToBackend(event, `/bags/${bagId}/equipment/${equipmentCode}`, {
    method: 'POST'
  })

  
  return result
})
