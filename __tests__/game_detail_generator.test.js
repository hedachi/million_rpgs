// game_detail_generator.test.js
const fs = require('fs');
const path = require('path');
const GameDetailGenerator = require('../generator/game_detail_generator');
// const game_detail_generator = require('../generator/game_detail_generator');
const LLM = require('../llm');

jest.mock('fs'); // fsモジュールをモック
jest.mock('../llm'); // LLMモジュールをモック

describe('GameDetailGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new GameDetailGenerator();
    generator.gameId = 'testGameId';
    generator.save = (gameDetail) => {
      console.log(gameDetail);
      generator.gameDetail = gameDetail;
    };
  });

  it('should generate and save stories via stream', async () => {
    const gameDetail = { stories: [] };
    const prompt = 'test prompt';

    fs.existsSync.mockReturnValue(true); // ファイルが存在するようにモック

    await generator.generateAndSaveViaStream(gameDetail, prompt);

    expect(LLM.generate).toHaveBeenCalledWith('testGameId', prompt, LLM.CLAUDE_BEST_MODEL, expect.any(Function));
    // expect(fs.appendFile).toHaveBeenCalled();
    // expect(gameDetail.stories.length).toBe(1);
    // expect(gameDetail.stories[0]).toContain('text1\ntext2\ntext3');
    // expect(generator.save).toHaveBeenCalledTimes(2);
    // expect(generator.save).toHaveBeenCalledWith(gameDetail);    
    expect(gameDetail.generateFinished).toBe(true);
    expect(generator.gameDetail.stories[0]).toBe(LLM.LLM_STREAM_RESPONSE.replace(/\|/g, ""));
  });
});
