const DynamoDB = require("../db/dynamo_db");
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dynamodb = new AWS.DynamoDB.DocumentClient();
const Common = require('../common');

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

    games = games.slice(0, 10);
    const tableName = `RPG_GameDetails-${process.env.STAGE}`;
    const details = await DynamoDB.batchGetItems(tableName , games.map(game => { return { gameId : game.gameId } }));
    console.log(details);
    games = games.map(game => {
      const detail = details.find(detail => detail.gameId === game.gameId);
      //game.merge(detail);
      const gameDetail = JSON.parse(detail.gameDetails);
      gameDetail.places = null;
      gameDetail.playTime = Math.floor(Math.random() * 1000);
      //最速くんか最速さんかをランダムに決める
      gameDetail.champion = Math.random() > 0.5 ? "最速くん" : "最速さん";
      Object.assign(game, gameDetail);
      return game;
    });

    return {
      statusCode: 200,
      headers: Common.DEFAULT_HEADERS,
      body: JSON.stringify(data),
    };
  }
  catch (error) {
    console.error("Error getting game:", error);
    return {
      statusCode: 500,
      headers: Common.DEFAULT_HEADERS,
      body: JSON.stringify({
        error: "ゲーム一覧の取得に失敗しました",
      }),
    };
  }
};
