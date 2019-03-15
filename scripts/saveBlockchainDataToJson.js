import TezosRpc from '../src/services/rpc/rpc'
import Helper from '../src/services/utils/helper'
const fs = require('fs');
const util = require('util');

(async () => {
  const { fork } = require('child_process');
  const tezosConfig = require('../static/config.json')
  const tezosRpc = new TezosRpc(tezosConfig.tezosRpcAddress)
  const block = 'head'
  const mostRecentCompletedCycle = await tezosRpc.getHeadCycle()
  const rawSnapshotData = require('../static/snapshotData.json')
  const snapshotData = new Helper().parseSnapshotData(rawSnapshotData)['snapshotblockNumberData']

  for(let i = 7; i <= mostRecentCompletedCycle + 6; i++) {
    const process = fork('./saveCycleDataToJson.js');
    const cycle = i;
    process.send({mostRecentCompletedCycle, block, snapshotData, cycle})
    process.on('message', (data) => {
      console.log(Object.keys(data)[0])
      fs.writeFile(Object.keys(data)[0]+".json", JSON.stringify(data), function(err) {
        if(err) {
          return console.log(err);
        }
        console.log('Saved: ', Object.keys(data)[0]+".json");
      });
    })
  }
})()
