const DynamoDB = require("../db/dynamo_db");
const GamePlayLogGenerator = require("../db/game_play_log_generator");
const LLM = require("../llm");
const Prompt = require('../prompt');


module.exports.handler = async (event) => {
  const queryParams = JSON.parse(event.body);

  const userPrompt = queryParams.prompt;
  const gameId = parseInt(queryParams.gameId);
  const language = queryParams.language;

  const game = {
    gameId: gameId,
    prompt: userPrompt,
    language: language,
  };
  await DynamoDB.save("Games", game);

  // const gameDetail = {
  //   gameId: gameId,
  //   language: language,
  //   stories: [],
  //   playerActions: [],
  //   userPrompt: userPrompt,
  // };

  // const randomInt = Math.floor(Math.random() * 9000) + 1000;
  // const gamePlayLogId = parseInt(new Date().getTime() + randomInt.toString());
  // const gamePlayLog = {
  //   gamePlayLogId: gamePlayLogId,
  //   gameId: gameId,
  //   language: language,
  //   userPrompt: userPrompt,
  //   stories: [],
  //   playerActions: [],
  // };
  // const gameStartPrompt = Prompt.gameStartPrompt(game);
  // await GamePlayLogGenerator.generateAndSaveViaStream(gamePlayLog, gameStartPrompt);

  return {
    statusCode: 200,
    body: JSON.stringify({
      // gameDetail: gameDetail,
    }),
  };
};
