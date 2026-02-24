import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const updateSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional()
}).refine(
  (data) => !data.end_date || !data.start_date || new Date(data.end_date) >= new Date(data.start_date),
  { message: 'end_date must be greater than or equal to start_date' }
)

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateSchema.parse)
  
  const result = await proxyToBackend(event, `/reservations/${id}`, {
    method: 'PUT',
    body
  })

  
  return result
})
