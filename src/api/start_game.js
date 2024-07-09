const DynamoDB = require("../db/dynamo_db");
const GameDetailUtil = require("../db/game_detail_util");
const LLM = require("../llm");
const Prompt = require('../prompt');


module.exports.handler = async (event) => {
  const queryParams = JSON.parse(event.body);

  const userPrompt = queryParams.prompt;
  const gameId = parseInt(queryParams.gameId);
  const language = queryParams.language;

  await DynamoDB.save("Games", {
    gameId: gameId,
    prompt: userPrompt,
    language: language,
  });

  const gameDetail = {
    gameId: gameId,
    language: language,
    stories: [],
    playerActions: [],
    userPrompt: userPrompt,
  };
  const gameStartPrompt = Prompt.gameStartPrompt(gameDetail);
  await GameDetailUtil.generateAndSaveViaStream(gameDetail, gameStartPrompt);

  return {
    statusCode: 200,
    body: JSON.stringify({
      // gameDetail: gameDetail,
    }),
  };
};
