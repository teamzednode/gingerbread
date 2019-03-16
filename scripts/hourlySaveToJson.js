import TezosRpc from '../src/services/rpc/rpc'
import Helper from '../src/services/utils/helper'
const fs = require('fs');
const { promisify } = require("util");
const writeFile = promisify(fs.writeFile);
const { fork } = require('child_process');

(async () => {
  const tezosConfig = require('../static/config.json')
  const tezosRpc = new TezosRpc(tezosConfig.tezosRpcAddress)
  const block = 'head'
  const mostRecentCompletedCycle = await tezosRpc.getHeadCycle()
  let cycle = mostRecentCompletedCycle + 6
  await tezosRpc.setCycle(cycle)
  const rawSnapshotData = require('../static/snapshotData.json')
  const cycleDataFromJson = require('../static/allCyclesData.json')

  // save rights data + snapshot data for latest future cycle
  const latestCycleFromSnapshotJson = rawSnapshotData[rawSnapshotData.length-1]['cycleNumber']
  if(latestCycleFromSnapshotJson != cycle) {
    const snapshotBlockNumber = await tezosRpc.getSnapshotBlockForCycle('head')
    const snapshotNumber = tezosRpc.snapshotNumber
    rawSnapshotData.push({
      'cycleNumber': cycle,
      'snapshotBlockNumber': snapshotBlockNumber,
      'snapshotNumber': tezosRpc.snapshotNumber      
    })
    await writeFile('../static/snapshotData.json', JSON.stringify(rawSnapshotData));
    console.log('cycle: ', cycle, ', snapshotNumber: ', snapshotNumber, ', snapshotBlockNumber: ', snapshotBlockNumber)
    console.log('Saved: snapshotData.json');

    const process = fork('./saveCycleDataToJson.js');
    let snapshotData = {}
    snapshotData[cycle] = snapshotBlockNumber
    process.send({mostRecentCompletedCycle, block, snapshotData, cycle})
    process.on('message', async (data) => {
      cycleDataFromJson[cycle] = data[cycle]
      await writeFile('../static/allCyclesData.json', JSON.stringify(cycleDataFromJson))
      console.log('Saved: allCyclesData.json with latest future cycle');
    })
  }

  // save rewards data for latest baked cycle
  const mostRecentCompletedCycleDatFromJson = cycleDataFromJson[mostRecentCompletedCycle]
  if (mostRecentCompletedCycleDatFromJson['prediction']) {
    cycle = mostRecentCompletedCycle
    await tezosRpc.setCycle(mostRecentCompletedCycle)
    const process = fork('./saveCycleDataToJson.js');
    const snapshotData = new Helper().parseSnapshotData(rawSnapshotData)['snapshotblockNumberData']
    process.send({mostRecentCompletedCycle, block, snapshotData, cycle})
    process.on('message', async (data) => {
      cycleDataFromJson[cycle] = data[cycle]
      await writeFile('../static/allCyclesData.json', JSON.stringify(cycleDataFromJson))
      console.log('Saved: allCyclesData.json with latest baked cycle');
    })
  }

})()
