import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const createSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createSchema.parse)
  
  const result = await proxyToBackend(event, '/bags/', {
    method: 'POST',
    body
  })

  
  return result
})
