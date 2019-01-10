import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Config from '@/components/Config'
import Rewards from '@/components/Rewards'

Vue.use(Router)

export default new Router({
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
      path: '/rewards',
      name: 'Rewards',
      component: Rewards
    }
  ]
})
