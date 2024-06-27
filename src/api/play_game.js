const DynamoDB = require("../db/dynamo_db");
const GameDetailUtil = require("../db/game_detail_util");
const LLM = require("../llm");
const Prompt = require('../prompt');
const AWS = require('aws-sdk');
const TextUtils = require('../text_utils');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const queryParams = event.queryStringParameters;
  const gameId = parseInt(queryParams.gameId);
  const scriptIndex = parseInt(queryParams.scriptIndex) || 0;
  const playerAction = queryParams.playerAction;

  const params = {
    TableName: 'RPG_GameDetails', // 使用するテーブル名
    Key: {
      gameId: gameId, // 取得したいアイテムのキー
    },
  };
  const gameDetail = (await dynamodb.get(params).promise()).Item;

  if (gameDetail.playerActions == null) {
    gameDetail.playerActions = [];
  }
  gameDetail.playerActions.push(playerAction);

  //scriptIndexまでのscriptを取得
  const lastScripts = gameDetail.stories[gameDetail.stories.length - 1];
  const splitScripts = TextUtils.splitTexts(lastScripts);
  const script = splitScripts.slice(0, scriptIndex + 1).join("\n");
  gameDetail.stories[gameDetail.stories.length - 1] = script;
  await DynamoDB.save("GameDetails", gameDetail);
  
  const progressWithPlayerAction = Prompt.progressWithPlayerAction(gameDetail, playerAction);
  await GameDetailUtil.generateAndSaveViaStream(gameDetail, progressWithPlayerAction);

  return {
    statusCode: 200,
    body: JSON.stringify({
      gameDetail: gameDetail,
    }),
  };
};
