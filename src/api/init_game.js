const DynamoDB = require("../db/dynamo_db");
const LLM = require("../llm");
const Prompt = require('../prompt');
// const axios = require('axios');
// const AWS = require('aws-sdk');
// require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const Common = require('../common');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const mainAiModel = LLM.CLAUDE_BEST_MODEL;

module.exports.handler = async (event) => {
  const randomInt = Math.floor(Math.random() * 9000) + 1000;
  const gameId = parseInt(new Date().getTime() + randomInt.toString());
  let gameDetails = null;
  let game = null;
  const params = event?.queryStringParameters || {};

  try {
    game = {
      gameId: parseInt(gameId),
      prompt: params.prompt,
      language: params.language,
      clearCriteria: params.clearCriteria,
      afterClearSettings: params.afterClearSettings,
      creator: params.creator,
    };
    await DynamoDB.save("Games", game);

    const prompt = Prompt.gameDetailsGeneratePrompt(game);
    const generationFunction = async () => {
      return await LLM.generate("ゲーム詳細の生成", prompt, mainAiModel);
    }
    let consistentGameDetails = await Common.generateConsistentContent(game, mainAiModel, generationFunction);

    consistentGameDetails = JSON.parse(consistentGameDetails);
    consistentGameDetails.settings = params.prompt;
    consistentGameDetails = JSON.stringify(consistentGameDetails);

    gameDetails = {
      gameId: gameId,
      gameDetails: consistentGameDetails,
    };
    await DynamoDB.save("GameDetails", gameDetails);

  } catch (error) {
    console.error("Error executing AI:", error);
    throw error;
  }
  return {
    statusCode: 200,
    headers: Common.DEFAULT_HEADERS,
    body: JSON.stringify({
      message: `"${game?.prompt}"のシナリオを作成しました: ${new Date().toLocaleString('ja-JP')}`,
      gameId: gameId,
      scenario: JSON.parse(gameDetails.gameDetails),
    }),
  };
};

