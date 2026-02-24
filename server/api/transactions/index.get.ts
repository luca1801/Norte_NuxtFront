import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const querySchema = z.object({
  type: z.enum(['withdrawal', 'return']).optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  skip: z.coerce.number().int().min(0).optional().default(0),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100)
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse)

  const params: Record<string, any> = {}
  if (query.type) params.type = query.type
  if (query.status) params.status = query.status
  params.skip = query.skip
  params.limit = query.limit

  return proxyToBackend(event, '/transactions/', {
    params,
    cache: false
  })
})
