import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import snapshot from './modules/snapshot'
import cycle from './modules/cycle'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    snapshot,
    cycle
  }
})
