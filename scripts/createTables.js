import AwsService from '../src/services/aws/aws'

(async () => {

const aws = new AwsService()

const generateParamsForTableCreation = ({tableName, partitionKey, partitionKeyType, sortKey, secondaryIndexName, secondaryIndexKey}) => {

  let generatedParams = {
      TableName : tableName,
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
          { AttributeName: partitionKey, KeyType: "HASH"},
          { AttributeName: sortKey, KeyType: "RANGE" }
      ],
      AttributeDefinitions: [
          { AttributeName: partitionKey, AttributeType: partitionKeyType || "S" },
          { AttributeName: sortKey, AttributeType: "N" }
      ],
  };

  if (secondaryIndexKey) {
    generatedParams['AttributeDefinitions'].push({
      AttributeName: secondaryIndexKey, AttributeType: "N"
    })
    generatedParams['LocalSecondaryIndexes'] =
      [
        {
          IndexName: secondaryIndexName,
          KeySchema: [
            {
              AttributeName: partitionKey,
              KeyType: 'HASH'
            },
            {
              AttributeName: secondaryIndexKey,
              KeyType: 'RANGE'
            },
          ],
          Projection: {
            ProjectionType: 'ALL'
          }
        },
      ]
  }
  return generatedParams
}

const rewardsTableParams = (tableName) => {
  const params = {
    'tableName': tableName,
    'partitionKey': 'delegate',
    'sortKey': 'cycle'
  }
  return generateParamsForTableCreation(params)
}
const snapshotDataTableParams = (tableName) => {
  const params = {
    'tableName': tableName,
    'partitionKey': 'cycleNumber',
    'partitionKeyType': 'N',
    'sortKey': 'snapshotBlockNumber'
  }
  return generateParamsForTableCreation(params)
}

await aws.createTable(rewardsTableParams('Rewards'))
await aws.createTable(snapshotDataTableParams('SnapshotData'))

console.log('Done Creating Tables')

})()