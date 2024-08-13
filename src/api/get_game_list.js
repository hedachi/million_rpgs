const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const params = {
      TableName: `RPG_Games-${process.env.STAGE}`, // 使用するテーブル名
    };

    const data = await dynamodb.scan(params).promise();
    const games = data.Items;
    //gamesをidでソート
    games.sort((a, b) => {
      if (a.gameId < b.gameId) return 1;
      if (a.gameId > b.gameId) return -1;
      return 0;
    });
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": '*',
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: JSON.stringify(data),
    };
  }
  catch (error) {
    console.error("Error getting game:", error);
    throw error;
  }
};
