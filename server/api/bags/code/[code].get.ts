import { proxyToBackend } from '../../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  
  return proxyToBackend(event, `/bags/code/${code}`, {
    cache: true,
    cacheMaxAge: 300,
    cacheKey: `bags:code:${code}`
  })
})
