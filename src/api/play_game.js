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
  
  const gameId = queryParams.gameId ? parseInt(queryParams.gameId) : null;
  let gamePlayLogId = queryParams.gamePlayLogId ? parseInt(queryParams.gamePlayLogId) : null;
  const scriptIndex = queryParams.scriptIndex ? parseInt(queryParams.scriptIndex) : 0;
  const playerAction = queryParams.playerAction;
  const gameEndReason = queryParams.gameEndReason;

  let gamePlayLog = null;

  if (gamePlayLogId == null) {
    const game = await dynamodb.get({
      TableName: `RPG_Games-${process.env.STAGE}`,
      Key: {
        gameId: gameId,
      },
    }).promise();
    console.log("game: ", game);
    const gameDetail = await dynamodb.get({
      TableName: `RPG_GameDetails-${process.env.STAGE}`,
      Key: {
        gameId: gameId,
      },
    }).promise();

    const randomInt = Math.floor(Math.random() * 9000) + 1000;
    gamePlayLogId = parseInt(new Date().getTime() + randomInt.toString());
    gamePlayLog = {
      gamePlayLogId: gamePlayLogId,
      gameId: gameId,
      language: game.Item.language,
      userPrompt: game.Item.prompt,
      stories: [],
      playerActions: [],
    };
    const gameStartPrompt = Prompt.gameStartPrompt(game.Item, gameDetail.Item.gameDetails);
    await GamePlayLogGenerator.generateAndSaveViaStream(gamePlayLog, gameStartPrompt);
  }
  else {
    const params = {
      TableName: `RPG_GamePlayLogs-${process.env.STAGE}`, //
      Key: {
        gamePlayLogId: gamePlayLogId, // 取得したいアイテムのキー
      },
    };
    gamePlayLog = (await dynamodb.get(params).promise()).Item;
  
    const gameDetail = await dynamodb.get({
      TableName: `RPG_GameDetails-${process.env.STAGE}`,
      Key: {
        gameId: gamePlayLog.gameId,
      },
    }).promise();
    if (gamePlayLog.playerActions == null) {
      gamePlayLog.playerActions = [];
    }
    gamePlayLog.playerActions.push(playerAction);
  
    //scriptIndexまでのscriptを取得
    const lastScripts = gamePlayLog.stories[gamePlayLog.stories.length - 1];
    const splitScripts = TextUtils.splitTexts(lastScripts);
    const script = splitScripts.slice(0, scriptIndex + 1).join("\n");
    gamePlayLog.stories[gamePlayLog.stories.length - 1] = script;
    await DynamoDB.save("GamePlayLogs", gamePlayLog);
    
    if (gameEndReason) {
      const progressWithGameEndReason = Prompt.scriptToGameEnd(gamePlayLog, gameEndReason, gameDetail.Item.gameDetails);
      await GamePlayLogGenerator.generateAndSaveViaStream(gamePlayLog, progressWithGameEndReason);
    }
    else {
      const progressWithPlayerAction = Prompt.progressWithPlayerAction(gamePlayLog, gameDetail.Item.gameDetails);
      await GamePlayLogGenerator.generateAndSaveViaStream(gamePlayLog, progressWithPlayerAction);
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    body: JSON.stringify(gamePlayLog),
  };
};
