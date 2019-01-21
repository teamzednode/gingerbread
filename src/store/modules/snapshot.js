// initial state
const state = {
  data: null
}

// actions
const actions = {
  loadFromConfigFile ({ commit }) {
    commit('setSnapshotData', require('../../../static/snapshots.json'))
  }
}

// mutations
const mutations = {
  setSnapshotData (state, data) {
    state.data = data
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
