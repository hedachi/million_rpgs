const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const queryParams = event.queryStringParameters;
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
    // if (data?.Item?.stories.length > 0) {
    //   data.Item.stories[0] = "[damage:player,mid]\n[damage:partner,high]\n[damage:101,low]\n" + data.Item.stories[0];
    // }
    return {
      statusCode: 200,
      body: JSON.stringify({
        gameDetails: data.Item,
      }),
    };
  }
  catch (error) {
    console.error("Error getting game:", error);
    throw error;
  }
};
