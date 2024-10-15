const Prompt = require('./prompt');
const LLM = require("./llm");

async function generateConsistentContent(game, mainAiModel, generationFunction, maxAttempts = 3) {
  let isOk = false;
  let attempt = 0;
  let response;

  console.log("game: " + JSON.stringify(game));

  while (!isOk && attempt < maxAttempts) {
      // ゲーム詳細の生成 (LLM)
      response = await generationFunction();
      
      // 矛盾チェックとクリア可能性チェック
      const checkResponse = await LLM.generate("矛盾とクリア可能性のチェック", Prompt.isConsistentAndClearable(response, game), mainAiModel);
      console.log("checkResponse:", checkResponse);
      
      const _response = JSON.parse(checkResponse);
      const isConsistent = _response.isConsistent;
      const isClearable = _response.isClearable;
      
      isOk = isConsistent && isClearable;
      
      if (!isOk) {
          console.log(`Attempt ${attempt + 1}: ${!isConsistent ? '一貫性がありません' : ''}${!isConsistent && !isClearable ? 'かつ' : ''}${!isClearable ? 'クリア不可能です' : ''}。再試行します。`);
      }
      
      attempt++;
  }

  if (attempt >= maxAttempts && !isOk) {
      console.log(`最大試行回数（${maxAttempts}回）に達しました。最後の生成結果を返します。`);
  }

  return response;
}

module.exports = {
  "DEFAULT_HEADERS": {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": '*',
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  },
  generateConsistentContent: generateConsistentContent
}
