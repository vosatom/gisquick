import { store as routingStore } from './routing/store'

import store from '@/store'


export default {
  install(Vue) {
    store.registerModule('routing', routingStore)
  },
}
