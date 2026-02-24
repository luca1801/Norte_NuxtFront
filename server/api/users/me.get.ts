import { proxyToBackend } from '../../utils/api-proxy'

export default defineEventHandler(async (event) => {
  return proxyToBackend(event, '/users/me', {
    cache: false
  })
})
