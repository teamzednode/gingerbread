<template>
  <div class="container pt-3">
    <div class="row">
      {{loadingText}}
      <b-pagination size="md" :total-rows="cyclesData.length" v-model="currentPage" :per-page="10">
      </b-pagination>
      <b-table striped hover :sort-by.sync='sortBy' :sort-desc.sync="sortDesc" :fields="cyclesDataFields" :items="cyclesData" :per-page="10" :current-page="currentPage">
        <template slot="cycle" slot-scope="data">
          <b-link :to="{name: 'CycleInfo', params: { cycle: data.value }}">{{data.value}}</b-link>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import TezosRpc from '@/services/rpc/rpc'
import TezosHelper from '@/services/utils/tezos'
import Aws from '@/services/aws/aws'

export default {
  data () {
    return {
      sortBy: 'cycle',
      sortDesc: true,
      cyclesDataFields: [
        'cycle',
        'status',
        {
          key: 'totalRewards',
          label: 'Total Rewards',
          formatter: (value) => { return this.tezosHelper.formatTezosNumericalData(value) }
        },
        {
          key: 'endorsingRewards',
          label: 'Endorsement Rewards',
          formatter: (value) => { return this.tezosHelper.formatTezosNumericalData(value) }
        },
        {
          key: 'bakingRewards',
          formatter: (value) => { return this.tezosHelper.formatTezosNumericalData(value) }
        },
        {
          key: 'stakingBalance',
          formatter: (value) => { return this.tezosHelper.formatTezosNumericalData(value) }
        }
      ],
      cyclesData: [],
      currentPage: 1,
      mostRecentCompletedCycle: 0,
      rewardsData: [],
      loadingText: 'Loading...',
      tezosRpc: null,
      tezosHelper: new TezosHelper(),
      aws: null
    }
  },
  computed: mapState([
    'user',
    'snapshot'
  ]),
  methods: {
    getStatusOfCycle (cycle) {
      let status = ''
      if (cycle >= this.mostRecentCompletedCycle) {
        status = 'Pending'
      } else if (cycle === this.mostRecentCompletedCycle) {
        status = 'Currently In Progress'
      } else if (cycle < this.mostRecentCompletedCycle && cycle > (this.mostRecentCompletedCycle - 5)) {
        status = 'Pending Rewards'
      } else {
        status = 'Delivered Rewards'
      }
      return status
    },
    async getAllCyclesData () {
      const allCyclesData = await this.aws.getRewardsDataForDelegate()
      for (let i = 0; i < allCyclesData.Items.length; i++) {
        const rewardsData = allCyclesData.Items[i]
        this.cyclesData.push({
          'cycle': rewardsData.cycle,
          'endorsingRewards': rewardsData.endorsingRewards,
          'bakingRewards': rewardsData.bakingRewards,
          'totalRewards': rewardsData.endorsingRewards + rewardsData.bakingRewards,
          'status': this.getStatusOfCycle(rewardsData.cycle),
          'stakingBalance': rewardsData.cycleData.staking_balance
        })
      }
    }
  },
  created: async function () {
    this.aws = new Aws(this.user.baker_tz_address)
    this.tezosRpc = new TezosRpc(this.user.tezos_rpc_address, this.user.baker_tz_address)
    this.mostRecentCompletedCycle = await this.tezosRpc.getHeadCycle()
    await this.getAllCyclesData()
    this.loadingText = ''
  }
}
</script>
