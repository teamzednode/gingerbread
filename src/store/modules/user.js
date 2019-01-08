// initial state
const state = {
  name: null,
  fee_percent: null,
  minimum_contribution: null,
  tezos_rpc_address: null,
  baker_tz_address: null
}

// actions
const actions = {
  loadFromConfigFile ({ commit }) {
    fetch('/static/config.json')
      .then((resp) => {
        if (resp.ok) {
          resp.json().then((configFromJson) => { commit('setUserConfig', configFromJson) })
        }
      })
  },

  saveToConfigFile ({ state, commit }, product) {

  }
}

// mutations
const mutations = {
  setUserConfig (state, { name, feePercent, minimumContribution, tezosRpcAddress, bakerTzAddress }) {
    state.name = name
    state.fee_percent = feePercent
    state.minimum_contribution = minimumContribution
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
