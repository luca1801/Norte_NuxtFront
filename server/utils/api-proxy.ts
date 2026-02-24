import type { H3Event } from 'h3'
import { getAuthToken } from './auth-cookies'

interface ProxyOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  params?: Record<string, any>
}

export async function proxyToBackend<T = any>(
  event: H3Event,
  endpoint: string,
  options: ProxyOptions = {}
): Promise<T> {
  const config = useRuntimeConfig(event)
  const token = event.context.authToken || getAuthToken(event)
  const { method = 'GET', body, params } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await $fetch<T>(`${config.backendUrl}${endpoint}`, {
      method,
      body,
      params,
      headers
    })

    return response
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500
    const detail = error.data?.detail
    
    let message = 'Erro interno do servidor'
    if (statusCode === 401) {
      message = 'Credenciais inválidas'
    } else if (statusCode === 403) {
      message = 'Acesso negado'
    } else if (statusCode === 404) {
      message = 'Registro não encontrado'
    } else if (statusCode === 400) {
      message = typeof detail === 'string' ? detail : (Array.isArray(detail) ? JSON.stringify(detail) : 'Dados inválidos')
    } else if (statusCode === 422) {
      message = typeof detail === 'string' ? detail : 'Erro de validação'
    } else if (statusCode === 409) {
      message = typeof detail === 'string' ? detail : 'Conflito de dados'
    } else if (detail) {
      message = typeof detail === 'string' ? detail : 'Erro na requisição'
    }
    
    throw createError({
      statusCode,
      message
    })
  }
}
