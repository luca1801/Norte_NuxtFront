import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const createSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(50),
  category: z.string().max(100).optional(),
  start_date: z.string(),
  end_date: z.string(),
  owner_id: z.string().uuid().optional().nullable(),
  location: z.string().max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['planned', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createSchema.parse)
  
  const processedBody: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'start_date' || key === 'end_date') {
        const dateStr = String(value)
        processedBody[key] = dateStr.includes(':') && dateStr.split(':').length === 2
          ? dateStr + ':00'
          : dateStr
      } else {
        processedBody[key] = value
      }
    }
  }

  const result = await proxyToBackend(event, '/events/', {
    method: 'POST',
    body: processedBody
  })

  
  return result
})
