import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Config from '@/components/Config'
import Cycles from '@/components/Cycles'
import CycleInfo from '@/components/CycleInfo'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/config',
      name: 'Config',
      component: Config
    },
    {
      path: '/cycles',
      name: 'Cycles',
      component: Cycles
    },
    {
      path: '/cycle_info/:cycle',
      name: 'CycleInfo',
      component: CycleInfo
    }
  ]
})
