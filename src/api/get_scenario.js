const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dynamodb = new AWS.DynamoDB.DocumentClient();
AWS.config.logger = console;

module.exports.handler = async (event) => {

  try {
    const queryParams = event.queryStringParameters;

    if (!queryParams.gameId && !queryParams.gamePlayLogId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": '*',
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify({
          error: `gameId: ${gameId} or gamePlayLogId: ${gamePlayLogId} が必須です`,
        }),
      };
    }

    let gameId = queryParams.gameId ? parseInt(queryParams.gameId) : null;

    if (!gameId) {
      const params = {
        TableName: `RPG_GamePlayLogs-${process.env.STAGE}`, //
        Key: {
          gamePlayLogId: parseInt(queryParams.gamePlayLogId), // 取得したいアイテムのキー
        },
      };
      gamePlayLog = (await dynamodb.get(params).promise()).Item;

      gameId = gamePlayLog.gameId;
    }

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
        gameId: gameId,
        scenario: JSON.parse(data.Item.gameDetails),
      }),
    };
  }
  catch (error) {
    console.error("Error:", error);
    console.error("error.stack: ", error.stack);
    throw error;
  }
};
