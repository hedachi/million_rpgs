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
    const consistentGameDetails = await generateConsistentContent(game, mainAiModel, generationFunction);

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

async function generateConsistentContent(game, mainAiModel, generationFunction, maxAttempts = 3) {
  let isConsistent = false;
  let attempt = 0;
  let response;

  while (!isConsistent && attempt < maxAttempts) {
      try {
          // ゲーム詳細の生成
          response = await generationFunction();
          
          // 矛盾チェック
          const isConsistentResponse = await LLM.generate("矛盾チェック", Prompt.isConsistent(response, game), mainAiModel);
          console.log("isConsistentResponse:", isConsistentResponse);
          
          // レスポンスのパース
          isConsistent = JSON.parse(isConsistentResponse).isConsistent;
          
          if (!isConsistent) {
              console.log(`Attempt ${attempt + 1}: 一貫性がありません。再試行します。`);
          }
          
          attempt++;
      } catch (error) {
          console.error("エラーが発生しました:", error);
          break; // エラーが発生した場合はループを抜ける
      }
  }

  return response;
}
