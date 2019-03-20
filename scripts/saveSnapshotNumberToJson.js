import TezosRpc from '../src/services/rpc/rpc'
const fs = require('fs');

(async () => {
  const tezosConfig = require('../static/config.json')
  const tezosRpc = new TezosRpc(tezosConfig.tezosRpcAddress)

  let block = 'head'
  const mostRecentCompletedCycle = await tezosRpc.getHeadCycle()

  let snapshotData = []
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

    snapshotData.push({
      'cycleNumber': cycle,
      'snapshotBlockNumber': snapshotBlockNumber,
      'snapshotNumber': tezosRpc.snapshotNumber
    })
    console.log('cycle: ', cycle, ', snapshotNumber: ', snapshotNumber, ', snapshotBlockNumber: ', snapshotBlockNumber)
    tezosRpc.setSnapshotBlockNumber(null)
  }

  fs.writeFile('../static/snapshotData.json', JSON.stringify(snapshotData), function(err) {
    if(err) {
      return console.log(err);
    }
    console.log('Saved: ', "snapshotData.json");
  });

})()
