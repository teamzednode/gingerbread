// initial state
const state = {
  name: null,
  fee_percent: null,
  tezos_rpc_address: null,
  baker_tz_address: null
}

// actions
const actions = {
  loadFromConfigFile ({ commit }) {
    commit('setUserConfig', require('../../../static/config.json'))
  }
}

// mutations
const mutations = {
  setUserConfig (state, { name, feePercent, minimumContribution, tezosRpcAddress, bakerTzAddress }) {
    state.name = name
    state.fee_percent = feePercent
    state.tezos_rpc_address = tezosRpcAddress
    state.baker_tz_address = bakerTzAddress
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
