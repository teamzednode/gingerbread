import Aws from '../../services/aws/aws'

// initial state
const state = {
  data: null
}

// actions
const actions = {
  loadFromConfigFile ({ commit }) {
    commit('setSnapshotData', require('../../../static/snapshots.json'))
  },
  async loadFromDynamoDB ({ commit }) {
    const aws = new Aws()
    commit('setSnapshotData', await aws.getAllSnapshotsData())
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
