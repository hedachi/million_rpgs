const DynamoDB = require("../db/dynamo_db");
const LLM = require("../llm");
const Prompt = require('../prompt');
// const axios = require('axios');
// const AWS = require('aws-sdk');
// require('aws-sdk/lib/maintenance_mode_message').suppress = true;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.handler = async (event) => {
  const randomInt = Math.floor(Math.random() * 9000) + 1000;
  const gameId = parseInt(new Date().getTime() + randomInt.toString());
  let gameDetails = null;
  let game = null;

  try {
    game = {
      gameId: parseInt(gameId),
      prompt: event?.queryStringParameters?.prompt,
      language: event?.queryStringParameters?.language,
      clearCriteria: event?.queryStringParameters?.clearCriteria,
      creator: event?.queryStringParameters?.creator,
    };
    await DynamoDB.save("Games", game);

    const mainAiModel = LLM.CLAUDE_BEST_MODEL;
    const gameDetailsGeneratePrompt = Prompt.gameDetailsGeneratePrompt(game);
    const response = await LLM.generate("ゲーム詳細の生成", gameDetailsGeneratePrompt, mainAiModel);
    gameDetails = {
      gameId: gameId,
      gameDetails: response,
    };
    await DynamoDB.save("GameDetails", gameDetails);

  } catch (error) {
    console.error("Error executing AI:", error);
    throw error;
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    body: JSON.stringify({
      message: `"${game?.prompt}"のシナリオを作成しました: ${new Date().
      toLocaleString('ja-JP')}`,
      gameId: gameId,
      scenario: JSON.parse(gameDetails.gameDetails),
    }),
  };
};
