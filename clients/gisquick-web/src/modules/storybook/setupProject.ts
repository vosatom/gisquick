import { setup } from '../storybook-compat'

import appData from '@/modules/storybook/mocks/app.json'
import project from '@/modules/storybook/mocks/project.json'
import { store } from '@/store/typed'

export function setupProject() {
  store.commit('app', appData.app)
  store.commit('user', appData.user)
  store.commit('project', project)
}
