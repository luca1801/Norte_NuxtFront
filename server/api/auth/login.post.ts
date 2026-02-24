import { z, ZodError } from 'zod'
import { setAuthCookie } from '../../utils/auth-cookies'
import { logger } from '../../utils/logger'

const loginSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(5, 'Mínimo 5 caracteres')
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (data) => {
    try {
      return loginSchema.parse(data)
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
  logger.info('Login attempt', { username: body.username })

  try {
    const response = await $fetch<{ access_token: string }>(`${config.backendUrl}/auth/login`, {
      method: 'POST',
      body: { username: body.username, password: body.password }
    })

    setAuthCookie(event, response.access_token)

    const user = await $fetch<{ id: string; username: string; email: string; role: string; is_active: boolean }>(`${config.backendUrl}/users/me`, {
      headers: { Authorization: `Bearer ${response.access_token}` }
    })

    logger.info('Login successful', { username: body.username, userId: user.id })

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
    
    let message = 'Erro ao fazer login'
    if (statusCode === 401) {
      message = 'Usuário ou senha incorretos'
    } else if (detail) {
      message = typeof detail === 'string' ? detail : 'Erro ao fazer login'
    }
    
    throw createError({
      statusCode: statusCode === 401 ? 401 : 400,
      message
    })
  }
})
