import AwsService from '../src/services/aws/aws'
import TezosRpc from '../src/services/rpc/rpc'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const tezosConfig = require('../static/config.json')
  const tezosRpc = new TezosRpc(tezosConfig.tezosRpcAddress)

  let block = 'head'
  const mostRecentCompletedCycle = await tezosRpc.getHeadCycle()

  const aws = new AwsService()

  for(let i = 1; i <= mostRecentCompletedCycle + 6; i++) {
    const cycle = i
    await tezosRpc.setCycle(cycle)
    let snapshotBlockNumber = null

    if (i > mostRecentCompletedCycle) {
      snapshotBlockNumber = await tezosRpc.getSnapshotBlockForCycle('head')
    } else {
      snapshotBlockNumber = await tezosRpc.getSnapshotBlockForCycle()
    }

    const snapshotNumber = tezosRpc.snapshotNumber
    var params = {
      TableName: 'SnapshotData',
      Item: {
        'cycleNumber' : {'N': cycle.toString() },
        'snapshotBlockNumber': {'N': snapshotBlockNumber.toString() },
        'snapshotNumber': {'N': tezosRpc.snapshotNumber.toString() }
      }
    };
    await aws.putItem(params);

    console.log('cycle: ', cycle, ', snapshotNumber: ', snapshotNumber, ', snapshotBlockNumber: ', snapshotBlockNumber)
  }
})()
