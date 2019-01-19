export default class {
  constructor (url, delegateHash) {
    this.url = url
    this.delegateHash = delegateHash
  }
  async setCycle (cycle) {
    if (cycle === 'head') {
      await this.setCycleToHead()
    } else {
      this.cycle = cycle
      await this.setSnapshotNumber()
    }
  }
  async getHeadCycle () {
    return this.getCycleFromFirstBlock(await this.getFirstBlockOfCycle('head'))
  }
  async setCycleToHead () {
    this.cycle = await this.getHeadCycle()
    await this.setSnapshotNumber()
  }
  async setSnapshotNumber () {
    this.snapshotNumber = await this.sendRequest('/chains/main/blocks/head/context/raw/json/rolls/owner/snapshot/' + this.cycle)
  }
  async sendRequest (endpoint) {
    const response = await fetch(this.url + endpoint)
    return response.json()
  }
  async getFirstBlockOfCycle (cycle) {
    const levelsInCurrentCycle = await this.sendRequest('/chains/main/blocks/' + cycle + '/helpers/levels_in_current_cycle')
    return levelsInCurrentCycle.first
  }
  async getCycleData () {
    return this.sendRequest('/chains/main/blocks/' + await this.snapshotBlockNumber() + '/context/delegates/' + this.delegateHash + '/')
  }
  async getSnapshotDelegateContractIds () {
    const delegateData = await this.getCycleData()
    return delegateData.delegated_contracts
  }
  async getContractsData (contractIds) {
    let contractsData = []
    for (let i = 0; i < contractIds.length; i++) {
      const contractId = contractIds[i]
      contractsData.push({
        contractId: contractId,
        contractData: await this.getContractData(contractId)
      })
    }
    return contractsData
  }
  async getContractData (contractId) {
    return this.sendRequest('/chains/main/blocks/' + await this.snapshotBlockNumber() + '/context/contracts/' + contractId)
  }
  getDelegationCycle () {
  // Delegation Snapshot is taken 7 cycles ago.
    return parseFloat(this.cycle - 7)
  }

  /*
    The rpc returns the snapshot number of the delegated cycle.
    For example if the 6th snapshot of the cycle is used, '6' is returned by the rpc.
    To get the snapshot block, calculate the total number of snapshots taken until the delegated cycle
    and then add the snpashot number of the delegated cycle to that number then multiply by 256 to get the block number.
    Example:
    For baking cycle 65, the snapshot used is taken in cycle 58.
    The rpc returns the snapshot of the cycle that was used: 6.
    First block of Cycle 58: 4096*58 = 237568
    Total snapshots until first block of cycle 58: 237568 / 256 =  928
    Add the snapshot number (+1 to include very first snapshot) from the rpc to the total snapshots until start of cycle: (928 + 6) + 1 = 935
    935th snapshot is used for cycle 58, get the block number: 935*256 = 239360
    Snapshotted Block Number = 23960
  */
  async snapshotBlockNumber () {
    const snapshotNumberOfCycle = parseFloat(this.snapshotNumber)
    const firstBlockOfSnapshotCycle = parseFloat(this.getDelegationCycle()) * 4096
    const totalNumberOfSnapshots = firstBlockOfSnapshotCycle / 256
    const totalSnapshotNumber = totalNumberOfSnapshots + snapshotNumberOfCycle + 1
    const snapshotBlockNumber = parseFloat(totalSnapshotNumber) * 256
    return snapshotBlockNumber
  }
  getCycleFromFirstBlock (blockNumber) {
    // current cycle = most recent completed cycle
    // - 1 to get the last completed cycle
    return parseFloat(Math.floor(blockNumber / 4096) - 1)
  }
}
