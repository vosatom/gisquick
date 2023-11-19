import Vue from 'vue'

export const setup = (callback: (app: typeof Vue) => void) => callback(Vue)
