<template>
  <div class="container pt-3">
    <b-row>
      <h1>Cycle {{currentCycle}}</h1>
    </b-row>
    <b-row v-if="doneLoading()">
      <b-table :fields="cycleMetaDataFields" :items="[cycleMetaData]" />
    </b-row>
    <b-row>
      {{loadingText}}
      <b-table v-if="doneLoading()" striped hover :fields="contractsDataFields" :items="contractsData" :per-page="perPage" :current-page="currentPage">
        <template slot="contractData" slot-scope="data">
          {{tezosHelper.formatTezosNumericalData(data.item.contractData.balance)}}
        </template>
      </b-table>
      <b-pagination v-if="doneLoading()" size="md" :total-rows="contractsData.length" v-model="currentPage" :per-page="perPage">
      </b-pagination>
    </b-row>
    <b-row v-if="doneLoading()">
      <b-button v-on:click="saveTransactionsFile()">Transactions Download</b-button>
    </b-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import TezosRpc from '@/services/rpc/rpc'
import TezosHelper from '@/services/utils/tezos'

export default {
  data () {
    return {
      perPage: 10,
      currentPage: 1,
      currentCycle: this.$route.params.cycle,
      cycleMetaDataFields: [
        'delegationCycle',
        'bakingCycle',
        'snapshotNumber',
        'snapshotBlockNumber',
        {
          key: 'stakingBalance',
          label: 'Staking Balance',
          formatter: (value) => { return this.tezosHelper.formatTezosNumericalData(value) }
        },
        {
          key: 'endorsingRewards',
          formatter: (value) => { return this.tezosHelper.formatTezosNumericalData(value) }
        },
        {
          key: 'bakingRewards',
          formatter: (value) => { return this.tezosHelper.formatTezosNumericalData(value) }
        },
        {
          key: 'totalRewards',
          formatter: (value) => { return this.tezosHelper.formatTezosNumericalData(value) }
        }
      ],
      contractsDataFields: [
        {key: 'contractId', label: 'Delegator'},
        {key: 'contractData', label: 'Delegator Balance'},
        {key: 'rewardsShare', label: 'Rewards Share'},
        {key: 'formattedRewardsAmount', label: 'Rewards Amount'}
      ],
      contractsData: [],
      tezosHelper: new TezosHelper(),
      loadingText: 'Loading...',
      cycleMetaData: {}
    }
  },
  computed: mapState([
    'user',
    'snapshot',
    'cycle'
  ]),
  methods: {
    setContractShare: function (stakingBalance, totalRewards) {
      for (let i = 0; i < this.contractsData.length; i++) {
        const rewardsSharePercentage = (this.contractsData[i].contractData.balance / stakingBalance)
        this.contractsData[i]['rewardsShare'] = (rewardsSharePercentage * 100).toFixed(2) + '%'
        this.contractsData[i]['rewardsAmount'] =
          (totalRewards * (1 - (parseFloat(this.user.fee_percent) / 100)) * (rewardsSharePercentage))
        this.contractsData[i]['formattedRewardsAmount'] = this.tezosHelper.formatTezosNumericalData(this.contractsData[i]['rewardsAmount'])
      }
    },
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
    },
    doneLoading: function () {
      return this.loadingText === ''
    },
    saveTransactionsFile: function () {
      let string = ''
      for (let i = 0; i < this.contractsData.length; i++) {
        string += this.contractsData[i].contractId + '=' + this.contractsData[i].rewardsAmount.toFixed(2) + '\n'
      }
      const blob = new Blob([string], {type: 'text/plain'})
      const e = document.createEvent('MouseEvents')
      const a = document.createElement('a')
      a.download = 'transactions.txt'
      a.href = window.URL.createObjectURL(blob)
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      a.dispatchEvent(e)
    }
  },
  created: async function () {
    await this.$store.dispatch('snapshot/loadFromJsonFile')
    const tezosRpc = new TezosRpc(this.user.tezos_rpc_address, this.user.baker_tz_address, this.$route.params.cycle)
    await tezosRpc.setCycle(this.$route.params.cycle)
    tezosRpc.setSnapshotBlockNumber(this.snapshot.snapshotblockNumberData[tezosRpc.cycle])
    this.currentCycle = tezosRpc.cycle

    const cycleData = await tezosRpc.getCycleData()
    this.cycleMetaData.delegationCycle = tezosRpc.getDelegationCycle()
    this.cycleMetaData.bakingCycle = this.currentCycle
    this.cycleMetaData.snapshotNumber = this.snapshot.snapshotData[tezosRpc.cycle]
    this.cycleMetaData.snapshotBlockNumber = this.snapshot.snapshotblockNumberData[tezosRpc.cycle]
    this.cycleMetaData.stakingBalance = cycleData.staking_balance
    this.cycleMetaData.endorsingRewards = this.cycle.data[this.currentCycle][this.user.baker_tz_address]['endorsingRewards']
    this.cycleMetaData.bakingRewards = this.cycle.data[this.currentCycle][this.user.baker_tz_address]['bakingRewards']
    this.cycleMetaData.totalRewards = this.cycleMetaData.endorsingRewards + this.cycleMetaData.bakingRewards

    this.contractsData = await tezosRpc.getContractsData(await tezosRpc.getSnapshotDelegateContractIds())
    this.contractsData.sort(this.compareBalance)
    this.contractsData = this.contractsData.filter(data => parseInt(data.contractData.balance) > 0)
    this.setContractShare(this.cycleMetaData.stakingBalance, this.cycleMetaData.totalRewards)
    this.loadingText = ''
  }
}
</script>
