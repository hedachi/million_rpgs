const DynamoDB = require("../db/dynamo_db");
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const params = {
      TableName: `RPG_Games-${process.env.STAGE}`, // 使用するテーブル名
    };

    const data = await dynamodb.scan(params).promise();
    let games = data.Items;
    //gamesをidでソート
    games.sort((a, b) => {
      if (a.gameId < b.gameId) return 1;
      if (a.gameId > b.gameId) return -1;
      return 0;
    });

    games = games.slice(0, 4);
    const tableName = `RPG_GameDetails-${process.env.STAGE}`;
    const details = await DynamoDB.batchGetItems(tableName , games.map(game => { return { gameId : game.gameId } }));
    console.log(details);
    games = games.map(game => {
      const detail = details.find(detail => detail.gameId === game.gameId);
      //game.merge(detail);
      Object.assign(game, detail);
      return game;
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
