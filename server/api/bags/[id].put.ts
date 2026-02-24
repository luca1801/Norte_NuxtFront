import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const updateSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateSchema.parse)
  
  const result = await proxyToBackend(event, `/bags/${id}`, {
    method: 'PUT',
    body
  })

  
  return result
})
