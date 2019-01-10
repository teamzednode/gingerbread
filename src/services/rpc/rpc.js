export default class {
  constructor (url, delegateHash) {
    this.url = url
    this.delegateHash = delegateHash
  }
  set setFirstBlockOfCurrentCycle (blockNumber) {
    this.firstBlockOfCurrentCycle = blockNumber
  }
  async sendRequest (endpoint) {
    const response = await fetch(this.url + endpoint)
    return response.json()
  }
  async getFirstBlockOfCurrentCycle () {
    const levelsInCurrentCycle = await this.sendRequest('/chains/main/blocks/head/helpers/levels_in_current_cycle')
    return levelsInCurrentCycle.first
  }
  async getSnapshotDelegateData () {
    return this.sendRequest('/chains/main/blocks/' + this.snapshotBlockNumber() + '/context/delegates/' + this.delegateHash + '/delegated_contracts')
  }
  async getContractsData (contractIds) {
    let contractsData = []
    for (let i = 0; i < contractIds.length; i++) {
      const contractId = contractIds[i]
      contractsData.push({
        contractId: contractId,
        contractData: await this.getContractData(contractId)}
      )
    }
    return contractsData
  }
  async getContractData (contractId) {
    return this.sendRequest('/chains/main/blocks/' + this.snapshotBlockNumber() + '/context/contracts/' + contractId)
  }
  snapshotBlockNumber () {
    return this.getFirstBlockOfSnapshotCycle(this.firstBlockOfCurrentCycle)
  }
  getFirstBlockOfSnapshotCycle () {
    // 4096 blocks per cycle * 7 cycles ago
    return this.firstBlockOfCurrentCycle - (4096 * 8)
  }
  getCurrentCycleFromCurrentBlock () {
    // current cycle = most recent completed cycle
    // - 1 to get the last completed cycle
    return (Math.floor(this.firstBlockOfCurrentCycle / 4096) - 1)
  }
}
