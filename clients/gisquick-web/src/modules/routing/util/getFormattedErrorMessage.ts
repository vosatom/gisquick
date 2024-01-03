import { AxiosError } from 'axios'

import type { ServiceError } from '@/modules/services/composables/serviceTypes'

export function getFormattedErrorMessage(error: ServiceError | undefined) {
  if (!error) return 'Error'
  if (error instanceof AxiosError && error.response?.data) {
    return error.response?.data.message
  }
  return error.message
}
