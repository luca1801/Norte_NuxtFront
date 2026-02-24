import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const createSchema = z.object({
  equipment_id: z.string().uuid().nullable().optional(),
  bag_id: z.string().uuid().nullable().optional(),
  event_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  transaction_type: z.enum(['withdrawal', 'return']),
  scheduled_date: z.string(),
  notes: z.string().optional(),
  return_condition: z.enum(['ok', 'damaged', 'maintenance', 'lost']).optional()
}).refine(
  (data) => (data.equipment_id !== undefined && data.equipment_id !== null && (data.bag_id === undefined || data.bag_id === null)) || 
            (data.bag_id !== undefined && data.bag_id !== null && (data.equipment_id === undefined || data.equipment_id === null)) ||
            (data.equipment_id === undefined && data.bag_id === undefined),
  { message: 'Exactly one of equipment_id or bag_id must be provided' }
)

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createSchema.parse)
  
  const result = await proxyToBackend(event, '/transactions/', {
    method: 'POST',
    body
  })

  
  return result
})
