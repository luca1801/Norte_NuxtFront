import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  scheduled_date: z.string().optional(),
  actual_date: z.string().optional(),
  notes: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateSchema.parse)
  
  const result = await proxyToBackend(event, `/transactions/${id}`, {
    method: 'PUT',
    body
  })

  
  return result
})
