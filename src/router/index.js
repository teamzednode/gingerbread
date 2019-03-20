import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Config from '@/components/Config'
import Cycles from '@/components/Cycles'
import CycleInfo from '@/components/CycleInfo'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
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
