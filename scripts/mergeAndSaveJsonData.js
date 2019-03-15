import TezosRpc from '../src/services/rpc/rpc'
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

(async () => {
  const tezosConfig = require('../static/config.json')
  const tezosRpc = new TezosRpc(tezosConfig.tezosRpcAddress)
  const mostRecentCompletedCycle = await tezosRpc.getHeadCycle()
  let allCyclesData = {}
  for(let i = 7; i <= mostRecentCompletedCycle + 6; i++){
    const cycleData = await readFile(i+'.json')
    allCyclesData = { ...allCyclesData, ...JSON.parse(cycleData.toString('utf8'))}
  }
  await writeFile('../static/allCyclesData.json', JSON.stringify(allCyclesData))
  console.log('Saved: allCyclesData.json')
})()
