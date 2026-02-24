import { proxyToBackend } from '../../../utils/api-proxy'
import { z } from 'zod'

const querySchema = z.object({
  skip: z.coerce.number().int().min(0).optional().default(0),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100)
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse)

  const params: Record<string, any> = {}
  params.skip = query.skip
  params.limit = query.limit

  return proxyToBackend(event, '/users/public', {
    params,
    cache: true,
    cacheMaxAge: 300,
    cacheKey: `users:public:${query.skip}:${query.limit}`
  })
})
