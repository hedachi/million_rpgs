const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dynamodb = new AWS.DynamoDB.DocumentClient();

class AbstractGenerator {
  constructor(gameId, prompt) {
    this.gameId = gameId;
    this.prompt = prompt;
  }

  getPrompt() {
    return this.prompt;
  }

  async prepare() {
    this.executeArguments = arguments;
  }

  async save(saveParams) {
    const params = {
      TableName: `RPG_${this.tableName}`,
      Item: {
        gameId: this.gameId,
        ...saveParams,
      }
    };

    try {
      console.log(`${this.tableName} にこのデータを保存します: `, params);
      await dynamodb.put(params).promise();
      console.log(`${this.tableName} への保存成功`);
    } catch (error) {
      console.error(`${this.tableName} への保存失敗。エラー: `, error);
      throw error;
    }
  }
  getSaveParams(content) {
    return {};
  }
}

module.exports = AbstractGenerator;
