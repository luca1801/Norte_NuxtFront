import { proxyToBackend } from '../../utils/api-proxy'
import { z } from 'zod'

const createSchema = z.object({
  equipment_id: z.string().uuid().nullable().optional(),
  bag_id: z.string().uuid().nullable().optional(),
  event_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  reserved_by: z.string().uuid().optional()
}).refine(
  (data) => (data.equipment_id !== undefined && data.equipment_id !== null && (data.bag_id === undefined || data.bag_id === null)) || 
            (data.bag_id !== undefined && data.bag_id !== null && (data.equipment_id === undefined || data.equipment_id === null)) ||
            (data.equipment_id === undefined && data.bag_id === undefined),
  { message: 'Exactly one of equipment_id or bag_id must be provided' }
).refine(
  (data) => new Date(data.end_date) >= new Date(data.start_date),
  { message: 'end_date must be greater than or equal to start_date' }
)

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createSchema.parse)
  
  const result = await proxyToBackend(event, '/reservations/', {
    method: 'POST',
    body
  })

  
  return result
})
