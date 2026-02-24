import { proxyToBackend } from '../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  return proxyToBackend(event, '/reports/equipment-usage', {
    cache: true,
    cacheMaxAge: 600,
    cacheKey: 'reports:equipment-usage'
  })
})
