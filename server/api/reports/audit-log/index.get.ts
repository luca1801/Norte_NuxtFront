import { proxyToBackend } from '../../../utils/api-proxy'
import { z } from 'zod'

const querySchema = z.object({
  skip: z.coerce.number().int().min(0).optional().default(0),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  table_name: z.string().optional(),
  action: z.enum(['INSERT', 'UPDATE', 'DELETE']).optional(),
  user_id: z.string().uuid().optional()
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse)

  const params: Record<string, any> = {}
  params.skip = query.skip
  params.limit = query.limit
  if (query.table_name) params.table_name = query.table_name
  if (query.action) params.action = query.action
  if (query.user_id) params.user_id = query.user_id

  const cacheKey = `reports:audit-log:${query.skip}:${query.limit}:${query.table_name || 'all'}:${query.action || 'all'}:${query.user_id || 'all'}`

  return proxyToBackend(event, '/reports/audit-log', {
    params,
    cache: true,
    cacheMaxAge: 600,
    cacheKey
  })
})
