const chara_data = require('./charas.json');

const SETTINGS_6 = `# 世界設定
くだもん諸島は、果物と動物が合体した「くだもん」たちが暮らす島々。人間はいない。
くだもん達は小学生ぐらいの知能レベルを持ち、話すことができる。
くだもん達は自分の長所を活かせるチャンスがあれば、積極的にトライする。
くだもん達の体からは自分の元になった果物が生えてくる。
明るく元気なコメディ風の物語。
`;

const background_images = `1:海が見える砂浜（くだもん諸島のデフォルト背景画像）
2:池か川
3:小屋
4:海
5:洞窟の中
6:森`;

const active_settings = SETTINGS_6;

const common_prompt =  (game_details) => { return `${active_settings}

# ゲーム設定
${game_details}

# 使用可能キャラクターのidと特徴
${
  chara_data.map((chara) => `${chara.id}. ${chara.character}`).join('\n')
}`; }


const story_script_prompt = (situation) => {
  let prompt = `# commands
[change_bg:(number)]
背景画像を指定番号のものに変更
${background_images}

[effect:(slash, fire)]
エフェクトを表示

`
// if (situation !== "game_over" && situation !== "start") {
// prompt += `
// [troubled:(trouble_description)]
// トラブルが起きたらこのコマンドを出力
// `
// }
if (situation !== "game_over") {
prompt += `
[choices:(option1|option2|option3)]
トラブルが起きなかったら、このコマンドを最後に出力
選択肢をプレイヤーに提示する
`
}
else
{
  prompt += `
[gameend]
物語が終了する場合、最後にこれを出力
`
}

prompt += `
# story scriptの書き方
セリフ9割
セリフの話者名に「僕」などの代名詞を使わない
地の文は2行続けない
一文は常に短く
主人公の一人称視点
改行を連続しない
commandも記述する
5〜10行で記述する
`;

// if (situation !== "game_over" && situation !== "start") {
//   prompt += `
// ほんのちょっとでもトラブルがあったら[troubled]コマンドを出力
// `}
if (situation !== "game_over") {
prompt += `
最後は、プレイヤーへの選択肢を3つ提示する
選択肢のうち1つか2つは、キャラクターの設定を踏まえて、トラブルになりそうなものにする
`
}
return prompt;
}

const story_script_example = (situation) => {

  if (situation !== "game_over") {
    return `# story scriptの出力フォーマット参考事例
[change_bg:6]
僕らはジャングルリン諸島の森にやってきた。
石川「よっしゃ！森に来たぞ！」
キャサリン「わあ、美味しそうな果物がいっぱい...」
スイートポテト「恭子を探すんだバナ！食べ物に気を取られちゃダメだバナ！」
石川「えー、でも腹減ったし...」
キャサリン「...ん？あれ見て！」
大きな木の上に何か動くものが見える。
キャサリン「もしかして、恭子！？」
[choices:木に登る|念のため逃げる|声をかける]`
  } else {
    return `# story scriptの出力フォーマット参考事例
石川「ふぅ...やっと森に着いたぞ」
キャサリン「恭子の匂いがするわ。この辺りかもしれないわね」
スイートポテト「よーし！探すぞー！」
石川「でも、疲れたな...ちょっと休憩しようぜ」
キャサリン「そうだね...」
そのままみんな眠ってしまい、日が暮れた。
[gameend]`;
// return `# story scriptの出力例
// 石川「ふぅ...やっと森に着いたぞ」
// キャサリン「恭子の匂いがするわ。この辺りかもしれないわね」
// スイートポテト「よーし！探すぞー！」
// 石川「でも、疲れたな...ちょっと休憩しようぜ」
// [troubled:疲労]
// キャサリン「そうだね...」
// そのままみんな眠ってしまい、日が暮れた。
// [gameend]`;
  }
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const gameStartPrompt = (game, gameDetails) => `${common_prompt(gameDetails)}

${story_script_prompt("start")}

${story_script_example("start")}

# 出力に関する注意
出力には、story script「だけ」を記述してください。
グダグダと同じような展開を繰り返すのは絶体NGです。

# story script
`;

const progressWithPlayerAction = (gamePlayLog, gameDetails) => `${common_prompt(gameDetails)}

${story_script_prompt()}

${story_script_example()}

# ここまでのstory script
${gamePlayLog.stories.join('\n')}

# プレイヤーが入力した主人公の次の行動
${gamePlayLog.playerActions[gamePlayLog.playerActions.length - 1] || 'なし'}

以上はプレイヤーが入力した主人公の行動です。
プレイヤーと主人公は一心同体ですので、実行不可能でないことは、主人公が"story scriptの続き"で最初に実行してください。
ただし、主人公の行動や発言以外のことは一切コントロールできません。設定の追加も無効です。

# 出力に関する注意
出力には、story script「だけ」を記述してください。
グダグダと同じような展開を繰り返すのは絶体NGです。

# story scriptの続き
`;

const gameClearCheck = (game, thisTurnStoryScript, gamePlayLog, gameDetails) => `${common_prompt(gameDetails)}

# このターンのstory script
${thisTurnStoryScript}

# 出力JSONフォーマット
()内に値を入れてください
{
  "clearLineNumberInStoryScript" : (クリア条件を満たしていない場合は-1、満たした場合は、このターンのstory scriptの何行目でクリア条件を満たしたか),
}

# クリア条件
${game.clearCriteria}

# 出力の注意
出力フォーマットに従ったJSONのみを出力してください`;

const isConsistentAndClearable = (generatedText, game) => `${common_prompt("")}

# クリア条件
${game.clearCriteria}

# クリア後に公開可能な情報/エピローグ
${game.afterClearSettings}

# コンテンツ
${generatedText}

# 出力JSONフォーマット
()内に値を入れてください
{
  "isConsistent" : (矛盾していない場合はtrue、矛盾している場合はfalse),
  "isInconsistentContent": (矛盾している場合は、コンテンツの問題箇所を記述),
  "isClearable" : (クリア条件が今後も達成不可能になる内容の場合はfalse、そうでなければtrue),
  "isNotClearableContent": (クリア条件が達成不可能な場合は、コンテンツの問題箇所を記述)
}

# 出力してほしいこと
「コンテンツ」を作成してもらいました。
「コンテンツ」が「クリア後に公開可能な情報/エピローグ」と矛盾しない場合は、isConsistentにtrueを出力してください。
また、「コンテンツ」に「クリア条件」を今後達成できなくなる設定が入っていなければ、isClearableにtrueを出力してください。
出力フォーマットに従ったJSONのみを出力してください。`;

const scriptToGameEnd = (game, gamePlayLog, gameEndReason, gameDetails) => `${common_prompt(gameDetails)}

${story_script_prompt("game_over")}

${story_script_example("game_over")}

# ここまでのstory script
${gamePlayLog.stories.join('\n')}

# 出力に関する注意
出力には、story script「だけ」を記述してください。
グダグダと同じような展開を繰り返すのは絶体NGです。

# ゲーム終了の理由
${gamePlayLog.isCleared ? "ゲームをクリアしたため" : gameEndReason}

${gamePlayLog.isCleared ? "# ゲームクリアによって公開された追加情報/エピローグ" : ""}
${gamePlayLog.isCleared ? game.afterClearSettings : ""}

# 物語の最後までのstory script（ゲーム終了の理由に従って物語を終わらせてください）
`;

const gameDetailsGeneratePrompt = (game) => `${active_settings}

# 詳細設定
${game.prompt}

# 使用可能キャラクターのidと特徴
${
  chara_data.map((chara) => `${chara.id}. ${chara.character}`).join('\n')
}

# 場所
${background_images}

# 出力JSONフォーマット
()内に値を入れてください
場所は最大3つ。ストーリー的に移動が不要なら1つでOK
{
  "title" : (ゲームのタイトル),
  "summary" : (ゲームの概要。ツイートぐらいの長さの文章),
  "main_character_id" : (使用可能キャラクターからidを指定)
}

# 出力の注意
詳細設定に忠実に、出力フォーマットに従ったJSONのみを出力してください`;


const newsPrompt = (gameDetails, gamePlayLog) => { return `${common_prompt(JSON.stringify(gameDetails))}
    
# ここまでのstory script
${gamePlayLog.stories.join('\n')}

# ニュースのタイトルの例（これは例です！このまま使うの絶対禁止！）
バナゾウ、みかんの皮が歯にはさまる

# ニュース本文の例（これは例です！このまま使うの絶対禁止！）
【くだもんアイランド 5日】スイカイヌが、バナゾウからバナナをもらって食べたところ、お腹いっぱいになってお昼寝してしまったことが、5日、わかった。現場にはバナナの皮が落ちていたことが確認された。スイカイヌは調べに対し、「小腹が空いており、おやつの時間だったので食べてしまった。今は反省している」と話している。

# 出力JSONフォーマット
()内に値を入れてください
場所は特に指示がなければ3つぐらい
{
  "title" : (ニュースのタイトル),
  "body" : (ニュース本文)
}

# 出力の注意
出力フォーマットに従ったJSONのみを出力してください`
};

module.exports = {
  gameStartPrompt: gameStartPrompt,
  progressWithPlayerAction: progressWithPlayerAction,
  scriptToGameEnd: scriptToGameEnd,
  gameDetailsGeneratePrompt: gameDetailsGeneratePrompt,
  newsPrompt: newsPrompt,
  gameClearCheck: gameClearCheck,
  isConsistentAndClearable: isConsistentAndClearable,
}
