const AWS = require('aws-sdk')
const REWARDS_TABLE = 'Rewards'
const defaultConfig = require('../../../static/aws-config.json')

export default class {
  constructor (delegateHash, config = defaultConfig) {
    this.delegateHash = delegateHash
    this.setupAws(config)
  }

  setupAws (config) {
    AWS.config.update(config)
    this.ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'})
    this.docClient = new AWS.DynamoDB.DocumentClient()
  }

  paramsForSimpleLookup (tableName, key, value, indexName, comparison = '=') {
    let params = {
      TableName: tableName,
      KeyConditionExpression: '#key ' + comparison + ' :value',
      ExpressionAttributeNames: {
        '#key': key
      },
      ExpressionAttributeValues: {
        ':value': value
      }
    }

    if (indexName) {
      params['IndexName'] = indexName
    }

    return params
  }

  paramsForDoubleLookup (tableName, key1, value1, key2, value2, indexName) {
    let params = {
      TableName: tableName,
      KeyConditionExpression: '#key1 = :value1 AND #key2 = :value2',
      ExpressionAttributeNames: {
        '#key1': key1,
        '#key2': key2
      },
      ExpressionAttributeValues: {
        ':value1': value1,
        ':value2': value2
      }
    }

    if (indexName) {
      params['IndexName'] = indexName
    }

    return params
  }

  paramsForScan (tableName, attributes) {
    let params = {
      TableName: tableName,
      ProjectionExpression: attributes
    }

    return params
  }

  async createTable (params) {
    return this.ddb.createTable(params).promise().then(function (data) {
      console.log('Created Table: ', data)
    }).catch(function (err) {
      console.log('Error Occured: ', err)
    })
  }

  async putItem (params) {
    return this.ddb.putItem(params).promise().then(function (data) {
      console.log('Inserted Data, unproccesed: ', data)
    }).catch(function (err) {
      console.log('Error Occured: ', err)
    })
  }

  async put (params) {
    return this.docClient.put(params).promise().then(function (data) {
      console.log('Inserted Data, unproccesed: ', data)
    }).catch(function (err) {
      console.log('Error Occured: ', err)
    })
  }

  async getAllSnapshotsData () {
    const params = this.paramsForScan('SnapshotData', 'cycleNumber, snapshotBlockNumber, snapshotNumber')
    return this.docClient.scan(params).promise().then(function (data) {
      let snapshotData = {}
      for (let i = 0; i < data.Items.length; i++) {
        snapshotData[data.Items[i].cycleNumber] = data.Items[i].snapshotBlockNumber
      }
      return snapshotData
    }).catch(function (err) {
      console.log('Error Occured: ', err)
    })
  }

  async getRewardsDataForDelegate (cycle, delegateHash = this.delegateHash) {
    const params = this.paramsForSimpleLookup(REWARDS_TABLE, 'delegate', delegateHash)
    return this.docClient.query(params).promise()
  }
}
