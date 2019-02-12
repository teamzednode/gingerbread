# RPC Info

Table of Contents
- Retrieving Snapshot Block
- Rewards Calculation
- Rewards Data in Gingerbread

# Retrieving Snapshot Block

It is common knowledge that a specific snapshot of a cycle is used to calculate the rewards and other details. A snapshot is taken every 256 blocks, and with a cycle being 4096 blocks, resulting in 16 total snapshots taken per cycle. One of those 16 snapshots is the one that is used to assign baking and endorsements rights.

The following RPC endpoint returns the snapshot number of the delegated cycle that's used for allocation of the provided cycle. Reminder that a delegated cycle is `-7` of the provided cycle, so the result from the rpc call will be of snapshot taken in the delegated cycle:

`/chains/main/blocks/`*`<block_id>`*`/context/raw/json/rolls/owner/snapshot/`*`<cycle_number>`*

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

Reference to code using above logic: 

To obtain the snapshotBlockNumber of a cycle using the rpc service provided by gingerbread, run the following code:

    import TezosRPC from 'src/services/rpc/rpc'
    const tezosRpc = new TezosRPC('localhost:8732') //set rpc host accordingly
    await tezosRpc.setCycle(75)
    console.log(await tezosRpc.getSnapshotBlockForCycle('head')) //pass in 'head' if finding snapshot block of unbaked cycles, otherwise leave empty if gathering snapshot for already baked cycle


Now that we have the chosen snapshot block number, we can retrieve necessary data for the cycle, such as staking balance:

`/chains/main/blocks/`**`281600`**`/context/delegates/`*`<delegate_hash>`*`/staking_balance`

 The above will return the staking balance from delegation cycle 68 used for cycle 75.

# Rewards Calculation

## For future/unbaked cycles:

Baking Rights and Endorsing Rights info is available for current cycle + 5 cycles. 

Reminder, for baking a block, 16 TZ are awarded. For endorsing a block 2 TZ are awarded if priority 0 delegate baked the block or 1 TZ are awarded if priority 1 delegate baked the block. (`ENDORSEMENT_REWARD = 2 / BLOCK_PRIORITY`)

The simplest way to estimate baking rewards for a future cycle is to obtain the baking rights for the cycle and see how many blocks with priority 0 have been assigned to the delegate and add 16 TZ for every block.

The following RPC call returns all the blocks with priority 0 assigned to specific delegate in a given cycle:

`chains/main/blocks/head/helpers/baking_rights?cycle=<cycle_number>&delegate=<delegate_hash>&max_priority=1`

If the above call responds with 4 blocks, the estimated block rewards would be `4 * 16 = 64` tz.

Reference to code where above logic is used:

To estimate the endorsement rewards, similarly, retrieve all the blocks where endorsing rights have been assigned to the delegate and add 2 TZ for each slot per block.

The following RPC call returns all the blocks assigned to a delegate for endorsing and slots per block as well:

`/chains/main/blocks/head/helpers/endorsing_rights?cycle=<cycle_number>&delegate=<delegate_hash>`

To get total endorsement rewards of the delegate, add 2 TZ for each slot. If the above call returns 10 blocks with 1 slot each and another 5 blocks with 2 slots in each, the total endorsement reward would be:
`10 blocks * 1 slot * 2 TZ + 5 blocks * 2 slots * 2 TZ = 40 TZ`

Reference to code where above logic is used:

The above estimation methods for baking rewards and endorsing rewards assume that a delegate assigned priority 0 will always bake the block. This is not always true and a better way of estimating could be to use past data to predict the probability of baking/endorsing. For now, gingerbread uses the simple estimation method and assumes priority 0 assigned delegate always bakes.

## For completely baked cycles:

- total rewards from rpc call (for a given cycle, total rewards info is available from 8 cycles later, e.g total rewards for cycle 68 is obtained from getting info about cycle 76)
-  baking rewards - baking rights then obtain metadata to confirm
-  endorsing rewards - endorsing rights then obtain metadata to confirm.

## Total Rewards
To get total rewards per cycle and other related data (i.e staking balance), following RPC endpoint can be called:

`/chains/main/blocks/<block_id>/context/delegates/<delegate_hash>/`

The block_id has to be the snapshot block number that can be obtained using the method outlined earlier. Going with the same example of baking cycle 75, using block number 281600, we are able to retrieve the staking balance using the above call and the total rewards for cycles 63 - 68. 

`chains/main/blocks/281600/context/delegates/tz1L3vFD8mFzBaS8yLHFsd7qDJY1t276Dh8i`

results in:

    {"balance":"26536618759","frozen_balance":"26475670781","frozen_balance_by_cycle":[{"cycle":63,"deposit":"3087000000","fees":"0","rewards":"98000000"},{"cycle":64,"deposit":"5184000000","fees":"0","rewards":"158666666"},{"cycle":65,"deposit":"4544000000","fees":"0","rewards":"139000000"},{"cycle":66,"deposit":"6336000000","fees":"4115","rewards":"197000000"},{"cycle":67,"deposit":"4800000000","fees":"0","rewards":"150000000"},{"cycle":68,"deposit":"1728000000","fees":"0","rewards":"54000000"}],"staking_balance":"250304006586","delegated_contracts":["KT1Xt2Fd5i1DQ7bi8xUHLVaZFRdPEZ794BUk","KT1XmsMhrbgapr7ib3NpxXhAxpUxNjeExeGg","KT1Wjax8sZkuicB5SRVoURgA7trXTL1ge4JG","KT1VMBGSpeWHDwHSS6KN4ZCxkA16KUbs9Fkj","KT1UVNdSoNj88DdzTupCcz8UEHczqkVEVGZq","KT1UJeNE4hJsKifqiyNwyhDyse3FnccbS3oC","KT1SdXTHweoLCHEwqzXVj6NMHmkhSpUbvH97","KT1QparWYce2j19VHtH1oBh59jwZFcrqD25a","KT1QkNnSBLuzZzWhTGsm1vaejpDtEkoGr6X1","KT1NytJWdmUZ66dZrYMZp4FcjeNfDrybekvP","KT1NGuoeNauFZCDW834Qu9xGfimXuEi9PVRf","KT1MoYp9jv4MvJSaNRXKNp12y9ZR1caR74gP","KT1LGm4RV6VWgaazB3n3STd9JQiF7dvVVc5G","KT1KwdFYokmhaHtTrUSHBgsVo58dks9Vxfzk","KT1KMu3xiaBSYNP3Zft8MznrtQHCHsLABSaU","KT1K7Fb3XS9B1oRG6QhbAA5FyTbcLe5eGZcG","KT1Jv2xrumgvntnLFt68fBkbu9FcMeF882vQ","KT1GzBqFQTfTwSsq6L78J6PU1fskAXG52TT9","KT1FYyziPkxz3mAr5vLGXnPkfREhsn5CkVv9","KT1Er648gh6C72yRWiKQyeezSiwM3QPyv1RB","KT1Eji2DjivNGL1AF8BTpGXNpaJ9uv1HFidF","KT1CSHU9thtQTnuRMrFz1CktP3XkFoWmsDxg","KT1BrPHwCJn6C5qVePKhq5Gc864AvWoMqw8F","KT1Auq9eu7qjMBjV9Rwufq8jnrmP1MLFcd94","KT1AJ9ZrvEmddgt7eXjuCvGJPwBVdkehNzWo","KT19kWBQVZevG2tgeEfiYqZvQR5xCcn8mswi"],"delegated_balance":"224564054493","deactivated":false,"grace_period":74}

Looking at the `frozen_balance_by_cycle` array specifically, we are able to retrieve the rewards for earlier cycles. To ensure accurate results, we only store the frozen balance for cycles before delegation cycle, in this case, data for cycles 63 to 67 is valid. So, to get rewards for cycle 67, we use the delegate data from cycle 75 (67 + 7 + 1 (for data accuracy)).

## Baking Rewards

To get accurate baking rewards, we get the baking rights as mentioned above but, since the block has already been baked, we can get more accurate results by querying the block metadata and checking if the baker is in fact the delegate that was assigned priority 0 or not.

1. Get baking rights using `chains/main/blocks/head/helpers/baking_rights?cycle=<cycle_number>&delegate=<delegate_hash>&max_priority=1`
2. Get block metadata and verify baker using `chains/main/blocks/head/metadata`
3. Add 16 TZ for every verified baking.

## Endorsement Rewards

Similarly, to baking rewards, first get the endorsing rights and then get block's operations to double check how many actual endorsements occurred:

1. Get endorsing rights using `/chains/main/blocks/head/helpers/endorsing_rights?cycle=<cycle_number>&delegate=<delegate_hash>`
2. Get block operations and verify endorsements per block using  `chains/main/blocks/head/metadata`


# Rewards Data in Gingerbread

Since, Gingerbread requires endorsing and baking rewards for every delegate, we parse each block and use its data to parse the endorsers and bakers and the corresponding rewards. We store this data in a AWS DynamoDB instance for quicker access.

Following  endpont is called for each block:
`chains/main/blocks/head/`
Which results in the following:

    {
    	...
	   	'metadata':	{
			    	'baker': 'baker_delegate_hash'
	    			}
    	'operations': [
				    	[{
							 'contents': [
								 {
									 'kind':'endorsement',
									 'metadata': {
										'delegate': 'endorser_delegate_hash',
										'balance_updates': [
											{
												'cateogry': ..	
											},
											{
												'category': 'rewards',
												'change': '2000000',
												'delegate': 'endorser_delegate_hash'
											}
										]
									 }
								 }],
				    	},
					    {
						    'contents': [{}]
					    },
					    {
						    'contents': [{}]
					    },					    
					    ],
					    [{...}],
				    	[{...}],
				    	[{...}]
			    	]
    	...
    }

From the above result, the `metadata['baker']` field is used to assign baking rewards to the baker. For the endorsing awards, the `operations[0]` array contains data about each endorser of the block. In each element of that array, the endorsement reward is located in the `contents[0].metadata.balanceUpdates` array of objects. To get the endorsement reward, find the object in the previous array whose `category` field has the value `"endorsement"` and retrieve `change`  field has the endorsement reward value for the delegate in `delegate` field. 

The following function parses the endorsement rewards of a block using the above logic: 

After retrieving the endorsing rewards and block rewards per block, they are added up to calculate the awards per cycle and that data is stored in the `Rewards` table with the following format:

    {
    	'cycle': <cycle_number>,
    	'delegate': <delegate_hash>,
    	'endorsingRewards': <total_endorsing_rewards_for_cycle_number>,
    	'bakingRewards': <total_baking_rewards_for_cycle_number>,
    	'cycleData': <snapshot_cycle_data>
    }

In the above table, the `cycleData` contains data about the delegation cycle for the cycle_number using the snapshot block. It has appropriate information such as `staking_balance ` for the cycle. 

The script for retrieving, parsing and storing the rewards data is here: 