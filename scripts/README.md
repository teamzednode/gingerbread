# Scripts
The following two scripts are run once to parse and store all cycles data from the Tezos JSON RPC:
- [saveSnapshotNumberToJson.js](https://github.com/teamzednode/gingerbread/blob/master/scripts/saveSnapshotNumberToJson.js "saveSnapshotNumberToJson.js")
 - [saveBlockchainDataToJson.js](https://github.com/teamzednode/gingerbread/blob/master/scripts/saveBlockchainDataToJson.js "saveBlockchainDataToJson.js")  

The `saveSnapshotNumberToJson.js` file stores the snapshot block number of each cycle that is used for delegating. It stores data from Cycle 1 to the most recent cycle that has snapshot data available (i.e most recent baked cycle + 6). The data is stored into the `../static/snapshotData.json` file. More info about gathering snapshot block number data can be found [here](https://github.com/teamzednode/gingerbread/blob/master/rpc_documentation.md#retrieving-snapshot-block)

The `saveBlockchainDataToJson.js` saves all rewards and staking balance data required for each cycle for each delegate. It stores data from Cycle 1 to the most recent cycle that has data available (i.e most recent baked cycle + 6). The script runs the `saveCycleDataToJson.js` script for every cycle and then saves the cycle per data into a json file in the same folder. Essentially, the scripts saves a json file for each cycle (e.g 1.json, 2.json .. 9.json, 10.json ... 90.json, etc.). After running this script, [mergeAndSaveJsonData.js](https://github.com/teamzednode/gingerbread/blob/master/scripts/mergeAndSaveJsonData.js "mergeAndSaveJsonData.js") has to be called to merge all the json files into one singular file [allCyclesData.json](https://github.com/teamzednode/gingerbread/blob/master/static/allCyclesData.json "allCyclesData.json"). 


The [hourlySaveToJson.js](https://github.com/teamzednode/gingerbread/blob/master/scripts/hourlySaveToJson.js "hourlySaveToJson.js") script is run every hour and appends to both the snapshotData.json file and allCyclesData.json with the latest cycle data. It first saves the latest snapshot info for the new cycles. Then, it updates the data for the most recent baked cycle. After that it appends the latest future cycle's rights to the allCyclesData.json file. For example, if cycle 65 was just baked, following three things happen:

- Add snapshot data for cycle 71 (65 +6) in  `snapshotData.json` 
- Update baking and endorsing data for cycle 65 in `allCyclesData.json`
- Update baking and endorsing rights for cycle 71 in `allCyclesData.json`
