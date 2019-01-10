<template>
  <div class="container pt-3">
    <div class="row">
      <h1>Cycle {{currentCycle}}</h1>
      <b-table striped hover :items="contractsData"></b-table>
      {{loadingText}}
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import TezosRpc from '@/services/rpc/rpc'
export default {
  data () {
    return {
      currentCycle: 0,
      contractsData: [],
      loadingText: 'Loading...'
    }
  },
  computed: mapState([
    'user'
  ]),
  created: async function () {
    const tezosRpc = new TezosRpc(this.user.tezos_rpc_address, this.user.baker_tz_address)
    tezosRpc.setFirstBlockOfCurrentCycle = await tezosRpc.getFirstBlockOfCurrentCycle()

    this.currentCycle = tezosRpc.getCurrentCycleFromCurrentBlock()

    const contractIdsArray = await tezosRpc.getSnapshotDelegateData()
    this.contractsData = await tezosRpc.getContractsData(contractIdsArray)
    this.loadingText = ''
  }
}
</script>
