import 'isomorphic-fetch'

export default class {
  constructor (url, delegateHash) {
    this.url = url
    this.delegateHash = delegateHash
  }
  setSnapshotBlockNumber (snapshotBlockNumber) {
    this.snapshotBlockNumberValue = snapshotBlockNumber
  }
  async setCycle (cycle) {
    if (cycle === 'head') {
      await this.setCycleToHead()
    } else {
      this.cycle = cycle
    }
  }
  async getHeadCycle () {
    // gets the most recently completed cycle, NOT the head cycle techincally.
    return this.getCycleFromFirstBlock(await this.getFirstBlockOfCycle('head'))
  }
  async setCycleToHead () {
    this.cycle = await this.getHeadCycle()
  }
  async sendRequest (endpoint) {
    const response = await fetch(this.url + endpoint)
    return response.json()
  }
  async getSnapshotBlockForCycle (block = null) {
    let blockNumber = block
    if (!block) {
      blockNumber = this.cycle * 4096
    }
    this.snapshotNumber = (await this.sendRequest('/chains/main/blocks/' + blockNumber + '/context/raw/json/rolls/owner/snapshot/' + this.cycle))[0]
    return this.snapshotBlockNumber()
  }
  async getFirstBlockOfCycle (cycle) {
    const levelsInCurrentCycle = await this.sendRequest('/chains/main/blocks/' + cycle + '/helpers/levels_in_current_cycle')
    return levelsInCurrentCycle.first
  }
  async getCycleData () {
    return this.sendRequest('/chains/main/blocks/' + this.snapshotBlockNumber() + '/context/delegates/' + this.delegateHash + '/')
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
    return this.sendRequest('/chains/main/blocks/' + this.snapshotBlockNumber() + '/context/contracts/' + contractId)
  }
  async getBakingRights (block, cycle, allDelegates = false, maxPriority = 1) {
    let url = '/chains/main/blocks/' + block + '/helpers/baking_rights?cycle=' + cycle + '&delegate=' + this.delegateHash + '&max_priority=' + maxPriority
    if (allDelegates) {
      url = '/chains/main/blocks/' + block + '/helpers/baking_rights?cycle=' + cycle + '&max_priority=' + maxPriority
    }
    return this.sendRequest(url)
  }
  async getEndorsingRights (block, cycle, allDelegates = false) {
    let url = '/chains/main/blocks/' + block + '/helpers/endorsing_rights?cycle=' + cycle + '&delegate=' + this.delegateHash
    if (allDelegates) {
      url = '/chains/main/blocks/' + block + '/helpers/endorsing_rights?cycle=' + cycle
    }
    return this.sendRequest(url)
  }
  async getEndorsingDataOfBlock (blockMetadata) {
    const endorsementsArray = blockMetadata.operations[0]
    let endorsementsData = {}
    for (let i = 0; i < endorsementsArray.length; i++) {
      let contentsArray = endorsementsArray[i].contents
      for (let j = 0; j < contentsArray.length; j++) {
        if (contentsArray[j].kind === 'endorsement') {
          const balanceUpdatesArray = contentsArray[j].metadata.balance_updates
          for (let k = 0; k < balanceUpdatesArray.length; k++) {
            if (balanceUpdatesArray[k].category === 'rewards') {
              const delegate = balanceUpdatesArray[k].delegate
              if (delegate in balanceUpdatesArray) {
                endorsementsData[delegate] += balanceUpdatesArray[k].change
              } else {
                endorsementsData[delegate] = balanceUpdatesArray[k].change
              }
            }
          }
        }
      }
    }
    return endorsementsData
  }
  async getBlockMetadata (block) {
    return this.sendRequest('/chains/main/blocks/' + block)
  }
  async getEndorsingRightsOfCycle (block, cycle) {
    const endorsingRightsData = await this.getEndorsingRights(block, cycle, true)
    let endorsementsData = {}
    for (let i = 0; i < endorsingRightsData.length; i++) {
      const delegate = endorsingRightsData[i]['delegate']
      if (delegate in endorsementsData) {
        endorsementsData[delegate] += ((endorsingRightsData[i]['slots'].length * 2) * 1000000)
      } else {
        endorsementsData[delegate] = 2 * 1000000
      }
    }
    return endorsementsData
  }
  async getBakingRightsOfCycle (block, cycle) {
    const bakingRightsData = await this.getBakingRights(block, cycle, true)
    let bakingRewardsData = {}
    for (let i = 0; i < bakingRightsData.length; i++) {
      const delegate = bakingRightsData[i]['delegate']
      if (delegate in bakingRewardsData) {
        bakingRewardsData[delegate] += (16 * 1000000)
      } else {
        bakingRewardsData[delegate] = (16 * 1000000)
      }
    }
    return bakingRewardsData
  }
  async getEndorsingRewardsForCycle (cycle) {
    const firstBlockOfCycle = (cycle * 4096) + 1
    const lastBlockOfCycle = firstBlockOfCycle + 4095
    let endorsingDataForCycle = {}
    let bakingDataForCycle = {}
    for (let j = firstBlockOfCycle; j <= lastBlockOfCycle; j++) {
      console.log('block: ', j)
      const blockMetadata = await this.getBlockMetadata(j + 1)
      const endorsingDataForBlock = await this.getEndorsingDataOfBlock(blockMetadata)
      const baker = blockMetadata.metadata.baker
      if (bakingDataForCycle[baker]) {
        bakingDataForCycle[baker] += 16 * 1000000
      } else {
        bakingDataForCycle[baker] = 16 * 1000000
      }
      for (const [delegate, endorseRewards] of Object.entries(endorsingDataForBlock)) {
        if (endorsingDataForCycle[delegate]) {
          endorsingDataForCycle[delegate] += parseFloat(endorseRewards)
        } else {
          endorsingDataForCycle[delegate] = parseFloat(endorseRewards)
        }
      }
    }
    return {endorsingDataForCycle, bakingDataForCycle}
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
    Snapshotted Block Number = 239360
  */
  snapshotBlockNumber () {
    if (!this.snapshotBlockNumberValue) {
      const snapshotNumberOfCycle = parseFloat(this.snapshotNumber)
      const firstBlockOfSnapshotCycle = parseFloat(this.getDelegationCycle()) * 4096
      const totalNumberOfSnapshots = firstBlockOfSnapshotCycle / 256
      const totalSnapshotNumber = totalNumberOfSnapshots + snapshotNumberOfCycle + 1
      const snapshotBlockNumber = parseFloat(totalSnapshotNumber) * 256
      this.snapshotBlockNumberValue = snapshotBlockNumber
    }
    return this.snapshotBlockNumberValue
  }
  getCycleFromFirstBlock (blockNumber) {
    // current cycle = most recent completed cycle
    // - 1 to get the last completed cycle
    return parseFloat(Math.floor(blockNumber / 4096) - 1)
  }
}
