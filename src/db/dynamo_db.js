const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dynamodb = new AWS.DynamoDB.DocumentClient();

class DynamoDB {
  static async save(tableName, saveParams, noLog = false) {
    const params = {
      TableName: `RPG_${tableName}`,
      Item: saveParams,
    };

    try {
      if (!noLog) console.log(`${tableName} にこのデータを保存します: `, params);
      await dynamodb.put(params).promise();
      console.log(`${tableName} への保存成功`);
    } catch (error) {
      console.error(`${tableName} への保存失敗。エラー: `, error);
      throw error;
    }
  }
}

module.exports = DynamoDB;
