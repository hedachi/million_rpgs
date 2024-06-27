const GameGenerator = require("../generator/game_generator");
const GameDetailGenerator = require("../generator/game_detail_generator");
const LLM = require("../llm");
const Prompt = require('../prompt');


module.exports.handler = async (event) => {
  console.log("### START execute_ai.js ###");
  const queryParams = JSON.parse(event.body);

  const userPrompt = queryParams.prompt;
  const gameId = parseInt(queryParams.gameId);

  const gameGenerator = new GameGenerator(gameId, userPrompt);
  gameGenerator.prepare();
  await gameGenerator.save(gameGenerator.getSaveParams());

  const gameDetailGenerator = new GameDetailGenerator(gameId, userPrompt)
  gameDetailGenerator.prepare();

  const gameStartPrompt = Prompt.gameStartPrompt(userPrompt);
  const gameDetail = {};
  await gameDetailGenerator.generateAndSaveViaStream(gameDetail, gameStartPrompt);

  console.log("### END execute_ai.js ###");
  return {
    statusCode: 200,
    body: JSON.stringify({
      // gameDetail: gameDetail,
    }),
  };
};
