import { createBrowserHistory } from "history";
import { provide } from "vue";

export default {
  setup() {
    let history = createBrowserHistory();


    provide('history', history)

    return { history }
  }
}
