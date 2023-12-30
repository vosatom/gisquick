import type { MaybeRef } from '@vueuse/core'
import type { AxiosError } from 'axios'

export type ServiceError = AxiosError | Error

export interface ServiceOptions<T> {
  isEnabled?: MaybeRef<boolean | undefined>
  debounce?: MaybeRef<number>
  onSuccess?: (data?: T) => void
  onError?: (data: ServiceError) => void
  initialData?: T
}
