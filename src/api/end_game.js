const DynamoDB = require("../db/dynamo_db");
const GamePlayLogGenerator = require("../db/game_play_log_generator");
const LLM = require("../llm");
const Prompt = require('../prompt');
const AWS = require('aws-sdk');
const TextUtils = require('../text_utils');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const queryParams = event.queryStringParameters;
  console.log("queryParams: ", queryParams);
  
  const gamePlayLogId = parseInt(queryParams.gamePlayLogId);

  const gamePlayLog = (await dynamodb.get({
    TableName: `RPG_GamePlayLogs-${process.env.STAGE}`,
    Key: {
      gamePlayLogId: gamePlayLogId,
    },
  }).promise()).Item;

  const gameDetail = await dynamodb.get({
    TableName: `RPG_GameDetails-${process.env.STAGE}`,
    Key: {
      gameId: gamePlayLog.gameId,
    },
  }).promise().Item;

  if (gamePlayLog.resultNews == null) {
    const mainAiModel = LLM.CLAUDE_BEST_MODEL;
    const resultNewsPrompt = Prompt.newsPrompt(gameDetail, gamePlayLog);
    const response = await LLM.generate("ゲーム終了", resultNewsPrompt, mainAiModel);
    console.log("resultNews: ", response);

    gamePlayLog.resultNews = response;

    await DynamoDB.save("GamePlayLogs", gamePlayLog);
  }

  // const processedData = response.replace(/\n/g, '\\n');
  // console.log("processedData: ", processedData);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    // body: JSON.stringify(response),
    body: JSON.stringify(JSON.parse(gamePlayLog.resultNews)),
  };
};
