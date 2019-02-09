# RPC Info

Table of Contents
- Retrieving Snapshot Block
- Rewards Calculation

# Retrieving Snapshot Block

It is common knowledge that a specific snapshot of a cycle is used to calculate the rewards and other details. A snapshot is taken every 256 blocks, and with a cycle being 4096 blocks, resulting in 16 total snapshots taken per cycle. One of those 16 snapshots is the one that is used to assign blocks and endorsements.

The following RPC endpoint returns the snapshot number of the delegated cycle that's used for allocation of the provided cycle. Reminder that a delegated cycle is `-7` of the provided cycle, so the result from the rpc call will be of snapshot taken in the delegated cycle:

`/chains/main/blocks/<block_id>/context/raw/json/rolls/owner/snapshot/<cycle_number>`

In the above call, for a given block, `block_id`,  the snapshot info can be retrieved for cycles 5 more than the current cycle and 5 less than the current cycle. For example, if the `block_id` is **293032** which is in cycle **71** , the `cycle_number` can be anywhere between **66** and **76**. 

Example request and response of above RPC call:

`/chains/main/blocks/`**`293032`**`/context/raw/json/rolls/owner/snapshot/`**`75`**

`[11]`

The response is the snapshot number (between 1-16 as one cycle as 16 snapshots) chosen for the delegation cycle `68` (75 - 7). Since, the RPC calls require a block number to retrieve data, we have to convert this snapshot number to a block number. 

To get the snapshot block number, calculate the total number of snapshots taken until the delegated cycle and then add the snapshot number of the delegated cycle to that number then multiply by 256 to get the block number.

For example:

For cycle 75, the delegation cycle is 68 and the snapshot used is the 11th one as returned by the RPC call.
First block of cycle 68: 

`4096 * 68 = 278528`

Total snapshots until first block of cycle 68:

` 278528 / 256 = 1088`

Add the snapshot number returned from rpc (`11` + 1 to include the very first snapshot) to total snapshots until start of cycle 68:

` 1088 + 11 + 1 = 1100`

1100th snapshot is used from delegation cycle 68 for cycle 75, get the block number of 1100th snapshot:

`1100 * 256 = 281600`

Snapshotted Block Number is **`281600`** 

Now that we have the chosen snapshot block number, we can retrieve necessary data for the cycle, such as staking balance:

`/chains/main/blocks/`**`281600`**`/context/delegates/<delegate_hash>/staking_balance`

 The above will return the staking balance from delegation cycle 68 used for cycle 75.

## Rewards Calculation

For future/unbaked cycles:

For baked cycles:
