import { proxyToBackend } from '../../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  return proxyToBackend(event, '/reports/audit-log/summary', {
    cache: true,
    cacheMaxAge: 600,
    cacheKey: 'reports:audit-log:summary'
  })
})
