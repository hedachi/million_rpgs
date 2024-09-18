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
  const rpgPrompt = event?.queryStringParameters?.prompt;
  const language = event?.queryStringParameters?.language;
  const randomInt = Math.floor(Math.random() * 9000) + 1000;
  const gameId = parseInt(new Date().getTime() + randomInt.toString());  

  try {
    const game = {
      gameId: parseInt(gameId),
      prompt: rpgPrompt,
      language: language,
    };
    await DynamoDB.save("Games", game);

    const mainAiModel = LLM.CLAUDE_BEST_MODEL;
    const gameDetailsGeneratePrompt = Prompt.gameDetailsGeneratePrompt(rpgPrompt);
    const response = await LLM.generate(gameDetailsGeneratePrompt, mainAiModel);
    const gameDetails = {
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
      message: `"${rpgPrompt}"のRPG生成指示を受け付けました: ${new Date().
      toLocaleString('ja-JP')}`,
      gameId: gameId
    }),
  };
};
