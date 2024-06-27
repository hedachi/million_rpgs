// __mocks__/llm.js
const LLM = {
  CLAUDE_BEST_MODEL: 'dummy_model',
  LLM_STREAM_RESPONSE: `[partner:|normal|]
メリ|ッサ「|目|が覚め|た|のね|。急|い|で|逃げる|わ|よ|」
|僕「え|？|ここ|は…|ゲーム|の|世界？|」
メリ|ッサ「|詳しい|説明は|後|。|今|は|生|き延びること|が先|決|よ|」
[|show:101|]|
ドラゴ|ンが|目を|覚ま|し|、威|嚇|する|ような|唸|り|声を上げ|る。
|僕「うわ|っ！|本|物|の|ドラゴ|ンだ！|」
メ|リッサ|「落|ち着い|て。|ゆ|っくり後|ず|さりする|の|よ|」
[|partner:attacking]|
メ|リッサが|剣を構|え、僕|を守|る|ように立|ち|はだかる|。|
ドラゴ|ン|「グ|オ|ォ|ォォ|！|」
[effect|:fire|]
[damage|:partner,mi|d]
メ|リッサ|「く|っ…|！|」
|僕「|メ|リッサ|！|大|丈夫|？|」
メ|リッサ|「問|題ない|。あ|なたは|逃げて|！|」
|僕「で|も…|」
[show|:110|]
突|然、|小|鳥が|現|れド|ラゴン|の|目|の|前を|飛び|回|る。
メ|リッサ|「今|よ|！|走|って|！|」
僕|た|ちは|急|いで|洞窟の|出|口へと|走り出した|。|`,
  generate: jest.fn((gameId, prompt, model, callback) => {
    LLM.LLM_STREAM_RESPONSE.split("|").forEach(text => callback(text));
  })
};

module.exports = LLM;
