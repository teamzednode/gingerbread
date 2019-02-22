export default class {
  parseSnapshotData (data) {
    let snapshotData = {}
    let snapshotblockNumberData = {}
    for (let i = 0; i < data.length; i++) {
      snapshotblockNumberData[data[i].cycleNumber] = data[i].snapshotBlockNumber
      snapshotData[data[i].cycleNumber] = data[i].snapshotNumber
    }
    return { snapshotData, snapshotblockNumberData }
  }
}
