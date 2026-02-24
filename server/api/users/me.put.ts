import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const updateSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  password: z.string().min(5).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, updateSchema.parse)
  
  const result = await proxyToBackend(event, '/users/me', {
    method: 'PUT',
    body
  })

  
  return result
})
