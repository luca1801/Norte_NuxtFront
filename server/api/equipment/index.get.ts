import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const querySchema = z.object({
  category: z.string().optional(),
  status: z.enum(['available', 'reserved', 'in_use', 'maintenance', 'excluded']).optional(),
  skip: z.coerce.number().int().min(0).optional().default(0),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100)
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse)

  const params: Record<string, any> = {}
  if (query.category) params.category = query.category
  if (query.status) params.status = query.status
  params.skip = query.skip
  params.limit = query.limit

  return proxyToBackend(event, '/equipment/', {
    params
  })
})
