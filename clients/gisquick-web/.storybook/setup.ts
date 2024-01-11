import Vue from 'vue'
import PortalVue from 'portal-vue'
import GetTextPlugin from 'vue-gettext'
import { ReactiveRefs } from 'vue-reactive-refs'
import Vue2TouchEvents from 'vue2-touch-events'

import Swiper from '../src/swiper'
import http from '../src/client'
import UI from '../src/ui/plugin'
import ScrollArea from '../src/ui/ScrollArea.vue'
import BasicScrollArea from '../src/ui/BasicScrollArea.vue'
import VImage from '../src/components/image/Image.vue'
import GenericInfopanel from '../src/components/GenericInfopanel.vue'

import '../src/assets/fonts/fonts.css'
import '../src/ui/base.scss'
import '../src/ui/layout.scss'
import '../src/ui/transitions/transitions.scss'
import '../src/backhandler'
import '../src/theme.scss'
import './styles.css'
import PopupLayer from '../src/ui/PopupLayer.vue'

import {
  Collapsible,
  CollapseTransition,
  CollapseWidth,
  SwitchTransition,
  SlideTop,
} from '../src/components/transitions'
import modules from '../src/modules'

// import all icons for hot reload functionality in dev mode
if (process.env.NODE_ENV === 'development') {
  import.meta.globEager('../icons/*.svg')
}

import translations from '../src/translations'

export function setup() {
  const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
    navigator.userAgent,
  )
  window.env = {
    mobile,
  }
  if (mobile) {
    Vue.use(Swiper)
  }

  Vue.use(Vue2TouchEvents, {
    disableClick: true,
    swipeTolerance: 30,
  })
  Vue.use(PortalVue)
  Vue.use(ReactiveRefs)
  Vue.use(GetTextPlugin, {
    translations,
    defaultLanguage: 'en-us',
    muteLanguages: ['en-us'],
  })

  Vue.component('scroll-area', ScrollArea)
  Vue.use(modules)
  Vue.use(UI)
  Vue.component('scroll-area', mobile ? BasicScrollArea : ScrollArea)
  // Vue.component('scroll-area', BasicScrollArea)
  Vue.component('v-collapsible', Collapsible)
  Vue.component('v-image', VImage)
  Vue.component('collapse-transition', CollapseTransition)
  Vue.component('collapse-width-transition', CollapseWidth)
  Vue.component('switch-transition', SwitchTransition)
  Vue.component('slide-top-transition', SlideTop)
  Vue.component('generic-infopanel', GenericInfopanel)
  Vue.component('popup-layer', PopupLayer)

  Vue.prototype.$http = http
}
