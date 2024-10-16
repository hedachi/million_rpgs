const DynamoDB = require("../db/dynamo_db");
const GamePlayLogGenerator = require("../db/game_play_log_generator");
const LLM = require("../llm");
const Prompt = require('../prompt');
const AWS = require('aws-sdk');
AWS.config.logger = console;
const TextUtils = require('../text_utils');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const Common = require('../common');

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const queryParams = event.queryStringParameters;
  console.log("queryParams: ", queryParams);
  
  const gamePlayLogId = parseInt(queryParams.gamePlayLogId);
  console.log("gamePlayLogId: ", gamePlayLogId);

  const gamePlayLog = (await dynamodb.get({
    TableName: `RPG_GamePlayLogs-${process.env.STAGE}`,
    Key: {
      gamePlayLogId: gamePlayLogId,
    },
  }).promise()).Item;

  console.log("gamePlayLog.gameId: ", gamePlayLog.gameId);

  const gameDetail = (await dynamodb.get({
    TableName: `RPG_GameDetails-${process.env.STAGE}`,
    Key: {
      gameId: parseInt(gamePlayLog.gameId),
    },
  }).promise()).Item;
  console.log("gameDetail: " + gameDetail);

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

  let responseBody = JSON.parse(gamePlayLog.resultNews);
  responseBody.gamePlayLogId = gamePlayLogId;
  console.log("gameDetail: " + gameDetail); 
  responseBody.main_character_id = JSON.parse(gameDetail.gameDetails).main_character_id;
  return {
    statusCode: 200,
    headers: Common.DEFAULT_HEADERS,
    // body: JSON.stringify(response),
    body: JSON.stringify(responseBody),
  };
};
