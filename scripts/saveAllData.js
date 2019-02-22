import AwsService from '../src/services/aws/aws'
import TezosRpc from '../src/services/rpc/rpc'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const tezosConfig = require('../static/config.json')
  const tezosRpc = new TezosRpc(tezosConfig.tezosRpcAddress)
  const block = 'head'
  const mostRecentCompletedCycle = await tezosRpc.getHeadCycle()
  const aws = new AwsService()
  const snapshotData = await aws.snapshotBlockNumberData()

  for(let i = 1; i <= mostRecentCompletedCycle + 6; i++) {
    await tezosRpc.setCycle(i)
    tezosRpc.setSnapshotBlockNumber(snapshotData[tezosRpc.cycle])
    console.log('Cycle: ', i)
    let endorsingDataForCycle = {}
    let bakingDataForCycle = {}
    if (i <= mostRecentCompletedCycle) {
      // get data from metadata - already baked
      const allData = await tezosRpc.getEndorsingAndBakingRewardsForCycle(i)
      endorsingDataForCycle = allData['endorsingDataForCycle']
      bakingDataForCycle = allData['bakingDataForCycle']
    } else {
      // get rights for future cycles
      endorsingDataForCycle = await tezosRpc.getEndorsingRightsOfCycle(block, i)
      bakingDataForCycle = await tezosRpc.getBakingRightsOfCycle(block, i)
    }

    const allDelegatesArray = Array.from(new Set(Object.keys(endorsingDataForCycle).concat(Object.keys(bakingDataForCycle))))

    for (let j = 0; j < allDelegatesArray.length; j++) {
      const delegate = allDelegatesArray[j]
      const endorsingRewards = endorsingDataForCycle[delegate] || 0
      const bakingRewards = bakingDataForCycle[delegate] || 0
      tezosRpc.delegateHash = delegate
      const cycleData = await tezosRpc.getCycleData()

      var params = {
        TableName: 'Rewards',
        Item: {
          'cycle' : i,
          'delegate' : delegate,
          'endorsingRewards': endorsingRewards,
          'bakingRewards': bakingRewards,
          'cycleData': cycleData
        }
      }
      await aws.put(params)
    }
  }
})()