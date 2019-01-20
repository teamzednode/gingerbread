<template>
  <div class="container pt-3">
    <div class="row">
      {{loadingText}}
      <b-pagination size="md" :total-rows="cyclesData.length" v-model="currentPage" :per-page="10">
      </b-pagination>
      <b-table striped hover :items="cyclesData" :per-page="10" :current-page="currentPage">
        <template slot="cycle" slot-scope="data">
          <b-link :to="{name: 'CycleInfo', params: { cycle: data.value }}">{{data.value}}</b-link>
        </template>
        <template slot="stakingBalance" slot-scope="data">
          {{tezosHelper.formatTezosNumericalData(data.value)}}
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
      cyclesData: [],
      currentPage: 1,
      mostRecentCompletedCycle: 0,
      mostRecentSnapshottedCycle: 0,
      loadingText: 'Loading...',
      tezosRpc: null,
      tezosHelper: new TezosHelper()
    }
  },
  computed: mapState([
    'user',
    'snapshot'
  ]),
  methods: {
    async getAllCyclesData () {
      for (let i = this.mostRecentCompletedCycle + 6; i > 0; i--) {
        let status = ''
        if (i > this.mostRecentCompletedCycle) {
          status = 'Pending'
        } else if (i === this.mostRecentCompletedCycle) {
          status = 'Currently In Progress'
        } else if (i < this.mostRecentCompletedCycle && i > (this.mostRecentCompletedCycle - 5)) {
          status = 'Pending Rewards'
        } else {
          status = 'Delivered Rewards'
        }

        await this.tezosRpc.setCycle(i)
        this.tezosRpc.setSnapshotNumber(this.snapshot.data[this.tezosRpc.cycle])
        const cycleData = await this.tezosRpc.getCycleData()

        this.cyclesData.push(
          {
            'cycle': i,
            'status': status,
            'stakingBalance': cycleData.staking_balance
          }
        )
      }
    }
  },
  created: async function () {
    this.tezosRpc = new TezosRpc(this.user.tezos_rpc_address, this.user.baker_tz_address)
    this.mostRecentCompletedCycle = await this.tezosRpc.getHeadCycle()
    this.mostRecentSnapshottedCycle = this.mostRecentCompletedCycle + 6
    await this.getAllCyclesData()
    this.loadingText = ''
  }
}
</script>
