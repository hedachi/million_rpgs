const DynamoDB = require('./dynamo_db');
const LLM = require("../llm");

const saveLogsToFile = false;

if (saveLogsToFile) {
  const fs = require('fs');
  const path = require('path');
}

class GameDetailUtil {
  static async generateAndSaveViaStream(gameDetail, prompt) {
    const mainAiModel = LLM.CLAUDE_BEST_MODEL;
    let response = "";
    let lastSavedResponseBreakLength = 0;
    if (gameDetail.stories == null) {
      gameDetail.stories = [];
    }
    const nextStoryIndex = gameDetail.stories.length;
    if (saveLogsToFile) {
      const logFileName = `../logs/${this.gameId}.txt`;
      const filePath = path.join(__dirname, '..', 'logs', logFileName);
      console.log("filePath: " + filePath);
    }
    
    await LLM.generate(this.gameId, prompt, mainAiModel, (text) => {
      if (saveLogsToFile) {
        console.log("+" + text);
        fs.appendFileSync(filePath, `${text}|`, (err) => {
          if (err) {
            console.error('ファイルへの追記に失敗しました:', err);
          }
        });
      }
      response += text;
      const responseBreakLength = response.match(/\n/g)?.length || 0;
      if (lastSavedResponseBreakLength != responseBreakLength && responseBreakLength % 3 == 0) {
        const originalResponse = response;
        const lastIndex = response.lastIndexOf("\n");
        response = response.slice(0, lastIndex);
        let removedPart = originalResponse.slice(lastIndex + 1);
        gameDetail.stories[nextStoryIndex] = response;
        DynamoDB.save("GameDetails", gameDetail, true);
        lastSavedResponseBreakLength = responseBreakLength;
        response += "\n"+ removedPart;
      }
    });
    gameDetail.stories[nextStoryIndex] = response;
    gameDetail.generateFinished = true;
    await DynamoDB.save("GameDetails", gameDetail);
  }
}

module.exports = GameDetailUtil;
