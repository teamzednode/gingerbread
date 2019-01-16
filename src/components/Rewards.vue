<template>
  <div class="container pt-3">
    <div class="row">
      <h1>Cycle {{currentCycle}}</h1>
    </div>
    <div class="row">
      {{loadingText}}
      <b-table v-if="loadingText === ''" striped hover :fields="contractsDataFields" :items="contractsData">
        <template slot="contractData" slot-scope="data">
          {{(parseFloat(parseFloat(data.item.contractData.balance)/1000000)).toFixed(2)}} ꜩ
        </template>
      </b-table>
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
      contractsDataFields: [
        {key: 'contractId', label: 'Delegator'},
        {key: 'contractData', label: 'Delegator Balance'}
      ],
      contractsData: [],
      loadingText: 'Loading...'
    }
  },
  computed: mapState([
    'user'
  ]),
  methods: {
    compareBalance: function (a, b) {
      const balanceA = parseFloat(a.contractData.balance)
      const balanceB = parseFloat(b.contractData.balance)

      let comparisonValue = 0

      if (balanceA < balanceB) {
        comparisonValue = 1
      } else if (balanceA > balanceB) {
        comparisonValue = -1
      }

      return comparisonValue
    }
  },
  created: async function () {
    const tezosRpc = new TezosRpc(this.user.tezos_rpc_address, this.user.baker_tz_address)
    tezosRpc.setFirstBlockOfCurrentCycle = await tezosRpc.getFirstBlockOfCurrentCycle()

    this.currentCycle = tezosRpc.getCurrentCycleFromCurrentBlock()

    await tezosRpc.setSnapshotNumber()
    const contractIdsArray = await tezosRpc.getSnapshotDelegateData()
    this.contractsData = await tezosRpc.getContractsData(contractIdsArray)
    this.contractsData.sort(this.compareBalance)
    this.loadingText = ''
  }
}
</script>
