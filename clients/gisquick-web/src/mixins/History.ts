import { createBrowserHistory } from 'history'
import { provide } from 'vue'

export default {
  setup() {
    const history = createBrowserHistory()

    provide('history', history)

    return { history }
  },
}
