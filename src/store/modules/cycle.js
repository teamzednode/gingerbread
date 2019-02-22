// initial state
const state = {
  data: null
}

// actions
const actions = {
  loadFromJsonFile ({ commit }) {
    commit('setCycleData', require('../../../static/allCyclesData.json'))
  }
}

// mutations
const mutations = {
  setCycleData (state, data) {
    state.data = data
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
