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
      tezosHelper: new TezosHelper()
    }
  },
  computed: mapState([
    'cycle',
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
      const cycles = Object.keys(this.cycle.data)
      for (let i = 0; i < cycles.length; i++) {
        const cycle = cycles[i]
        if (this.user.baker_tz_address in this.cycle.data[cycle]) {
          const endorsingRewards = this.cycle.data[cycle][this.user.baker_tz_address]['endorsingRewards']
          const bakingRewards = this.cycle.data[cycle][this.user.baker_tz_address]['bakingRewards']
          const totalRewards = endorsingRewards + bakingRewards
          this.cyclesData.push({
            'cycle': cycles[i],
            'endorsingRewards': endorsingRewards,
            'bakingRewards': bakingRewards,
            'totalRewards': totalRewards,
            'status': this.getStatusOfCycle(cycle),
            'stakingBalance': this.cycle.data[cycle][this.user.baker_tz_address]['stakingBalance']
          })
        }
      }
    }
  },
  created: async function () {
    this.tezosRpc = new TezosRpc(this.user.tezos_rpc_address, this.user.baker_tz_address)
    this.mostRecentCompletedCycle = await this.tezosRpc.getHeadCycle()
    await this.getAllCyclesData()
    this.loadingText = ''
  }
}
</script>
