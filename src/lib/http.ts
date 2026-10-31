import axios from 'axios'
import type { ApiEnvelope } from '../types'

export function unwrapData<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload && (payload as ApiEnvelope<T>).data !== undefined) {
    return (payload as ApiEnvelope<T>).data as T
  }
  return payload as T
}

export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && Array.isArray((payload as ApiEnvelope<T[]>).data)) {
    return (payload as ApiEnvelope<T[]>).data as T[]
  }
  return []
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string; errors?: Record<string, string[]> }
      | undefined

    if (data?.errors) {
      return Object.values(data.errors).flat().join(' ')
    }

    return data?.message ?? data?.error ?? error.message ?? 'Request failed.'
  }

  return 'Something went wrong. Please try again.'
}
