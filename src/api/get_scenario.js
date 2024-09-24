const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const queryParams = event.queryStringParameters;

    if (!queryParams.gameId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": '*',
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify({
          error: "gameIdがありません！！！",
        }),
      };
    }

    const gameId = parseInt(queryParams.gameId);

    // getメソッドのパラメータを設定
    const params = {
      TableName: `RPG_GameDetails-${process.env.STAGE}`, // 使用するテーブル名
      Key: {
        gameId: gameId, // 取得したいアイテムのキー
      },
    };

    // データを取得
    const data = await dynamodb.get(params).promise();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": '*',
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: JSON.stringify({
        scenario: JSON.parse(data.Item.gameDetails),
      }),
    };
  }
  catch (error) {
    console.error("Error getting game:", error);
    throw error;
  }
};
