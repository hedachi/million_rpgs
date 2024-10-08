const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dynamodb = new AWS.DynamoDB.DocumentClient();

class DynamoDB {
  static async save(tableName, saveParams, noLog = false) {
    const params = {
      TableName: `RPG_${tableName}-${process.env.STAGE}`,
      Item: saveParams,
    };

    try {
      // if (!noLog) console.log(`${tableName} にこのデータを保存します: `, params);
      await dynamodb.put(params).promise();
      console.log(`${tableName} への保存成功`);
    } catch (error) {
      console.error(`${tableName} への保存失敗。エラー: `, error);
      throw error;
    }
  }

  static async batchGetItems(tableName, keys) {
    console.log(`batchGetItems tableName: ${tableName}, Keys: ${
      JSON.stringify(keys)
    }`);
    const params = {
      RequestItems: {
        [tableName]: {
          Keys: keys
        }
      }
    };
    console.log(`params: ${JSON.stringify(params)}`);

  
    return new Promise((resolve, reject) => {
      dynamodb.batchGet(params, (error, data) => {
        if (error) {
          console.error("Error fetching items:", error);
          reject(error);
        } else {
          resolve(data.Responses[tableName]);
        }
      });
    });
  }
}

module.exports = DynamoDB;
