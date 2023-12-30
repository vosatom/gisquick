/// <reference types="vite/client" />

import type { MapWithExt } from '@/composables/useOlMap'
import type { AxiosStatic } from 'axios'
import type { UserPayload } from './interfaces'
import type { Map } from 'ol'
import type { ProjectConfig } from '@/store/interfaces'

interface HTTPClient extends AxiosStatic {
  login(username: string, password: string): Promise<UserPayload>
  logout(): Promise<never>
  project(project: string): Promise<ProjectConfig>
}

declare global {
  interface Window {
    /** @deprecated use `inject` instead */
    $map: Map
    /** @deprecated use `inject` instead */
    $swiper: {}
    /** @deprecated use `inject` instead */
    $http: HTTPClient
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $map: MapWithExt
    $http: HTTPClient
  }
}

export {}
