import { z, ZodError } from 'zod'
import { setAuthCookie } from '../../utils/auth-cookies'
import { logger } from '../../utils/logger'

const registerSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(50),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(['admin', 'manager', 'operator', 'viewer']).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (data) => {
    try {
      return registerSchema.parse(data)
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map(issue => {
          const path = issue.path.join('.')
          return `${path ? path + ': ' : ''}${issue.message}`
        })
        throw createError({
          statusCode: 400,
          message: issues.join(', ')
        })
      }
      throw error
    }
  })
  
  const config = useRuntimeConfig(event)
  logger.info('Register attempt', { username: body.username, email: body.email })

  try {
    const user = await $fetch<{ id: string; username: string; email: string; role: string; is_active: boolean }>(`${config.backendUrl}/auth/register`, {
      method: 'POST',
      body: {
        username: body.username,
        email: body.email,
        password: body.password,
        role: body.role || 'operator'
      }
    })

    const loginResponse = await $fetch<{ access_token: string }>(`${config.backendUrl}/auth/login`, {
      method: 'POST',
      body: { username: body.username, password: body.password }
    })

    setAuthCookie(event, loginResponse.access_token)

    logger.info('Register successful', { username: body.username, userId: user.id })

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      }
    }
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500
    const detail = error.data?.detail
    
    let message = 'Erro ao cadastrar usuário'
    if (statusCode === 400 && detail) {
      message = typeof detail === 'string' ? detail : 'Dados inválidos'
    } else if (detail) {
      message = typeof detail === 'string' ? detail : 'Erro ao cadastrar'
    }
    
    throw createError({
      statusCode: 400,
      message
    })
  }
})
