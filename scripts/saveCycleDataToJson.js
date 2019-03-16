import TezosRpc from '../src/services/rpc/rpc'
const tezosConfig = require('../static/config.json')
const tezosRpc = new TezosRpc(tezosConfig.tezosRpcAddress)

process.on('message', async ({mostRecentCompletedCycle, block, snapshotData, cycle}) => {
  await tezosRpc.setCycle(cycle)
  tezosRpc.setSnapshotBlockNumber(snapshotData[tezosRpc.cycle])
  let endorsingDataForCycle = {}
  let bakingDataForCycle = {}
  let prediction = false

  if (cycle <= mostRecentCompletedCycle) {
    // get data from metadata - already baked
    const allData = await tezosRpc.getEndorsingAndBakingRewardsForCycle(cycle)
    endorsingDataForCycle = allData['endorsingDataForCycle']
    bakingDataForCycle = allData['bakingDataForCycle']
  } else {
    // get rights for future cycles
    endorsingDataForCycle = await tezosRpc.getEndorsingRightsOfCycle(block, cycle)
    bakingDataForCycle = await tezosRpc.getBakingRightsOfCycle(block, cycle)
    prediction = true
  }

  const allDelegatesArray = Array.from(new Set(Object.keys(endorsingDataForCycle).concat(Object.keys(bakingDataForCycle))))
  const cycleRewardsData = {}
  cycleRewardsData[cycle] = {}

  for (let j = 0; j < allDelegatesArray.length; j++) {
    console.log('j: ', j, '/', allDelegatesArray.length)
    const delegate = allDelegatesArray[j]
    const endorsingRewards = endorsingDataForCycle[delegate] || 0
    const bakingRewards = bakingDataForCycle[delegate] || 0
    tezosRpc.delegateHash = delegate
    const cycleData = await tezosRpc.getCycleData()
    cycleRewardsData[cycle]['prediction'] = prediction
    cycleRewardsData[cycle][delegate] = {
      'endorsingRewards': endorsingRewards,
      'bakingRewards': bakingRewards,
      'stakingBalance': cycleData.staking_balance
    }
  }
  process.send(cycleRewardsData)
  process.exit()
});
