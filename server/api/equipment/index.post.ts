import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const createSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'damaged']).optional(),
  bag_id: z.string().uuid().nullable().optional(),
  location: z.string().max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['available', 'reserved', 'in_use', 'maintenance', 'excluded']).optional(),
  qr_code: z.string().max(100).optional(),
  serial: z.string().max(100).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createSchema.parse)
  
  const result = await proxyToBackend(event, '/equipment/', {
    method: 'POST',
    body
  })

  
  return result
})
