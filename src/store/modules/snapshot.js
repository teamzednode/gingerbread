import Helper from '@/services/utils/helper'

// initial state
const state = {
  snapshotData: null,
  snapshotblockNumberData: null
}

// actions
const actions = {
  async loadFromJsonFile ({ commit }) {
    commit('setSnapshotData', require('../../../static/snapshotData.json'))
  }
}

// mutations
const mutations = {
  setSnapshotData (state, data) {
    const { snapshotData, snapshotblockNumberData } = new Helper().parseSnapshotData(data)
    state.snapshotData = snapshotData
    state.snapshotblockNumberData = snapshotblockNumberData
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
