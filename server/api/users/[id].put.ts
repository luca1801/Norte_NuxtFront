import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const updateSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'manager', 'operator', 'viewer']).optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(5).optional()
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateSchema.parse)
  
  const result = await proxyToBackend(event, `/users/${id}`, {
    method: 'PUT',
    body
  })

  
  return result
})
