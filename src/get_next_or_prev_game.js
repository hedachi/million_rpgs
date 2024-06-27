const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  console.log("### START get_game.js ###");
  try {
    const gameId = parseInt(event.queryStringParameters.gameId);
    const isPrev = event.queryStringParameters.isPrev;

    // 指定したGameIdに最も近いGameIdのゲームを取得する
    // gameIdだけ取得
    const queryParams = {
      TableName: 'RPG_Games',
      ProjectionExpression: 'gameId',
    };

    const data = await dynamodb.scan(queryParams).promise();

    // Items配列の中の要素はgameIdを持っている
    // このgameIdの値が、parseInt(event.queryStringParameters.gameId)したgameIdよりも大きいかつ最も近いものを取得する
    // ただし、isPrevがtrueの場合、gameIdよりも小さい最も近いgameIdを取得する
    const nearestGame = data.Items.reduce((nearest, game) => {
      const gameGameId = parseInt(game.gameId);
      if (isPrev) {
        if (gameGameId < gameId && (!nearest || gameGameId > parseInt(nearest.gameId))) {
          return game;
        }
      } else {
        if (gameGameId > gameId && (!nearest || gameGameId < parseInt(nearest.gameId))) {
          return game;
        }
      }
      return nearest;
    }, null);

    return {
      statusCode: 200,
      body: JSON.stringify({
        gameId: nearestGame.gameId,
      }),
    };
  }
  catch (error) {
    console.error("Error getting game:", error);
    throw error;
  }
};
