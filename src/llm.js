const Anthropic = require("@anthropic-ai/sdk");
const { log } = require("console");
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

class LLM {
  static CLAUDE_BEST_MODEL = "claude-3-5-sonnet-20240620";

  static async generate(purpose, prompt, model = LLM.CLAUDE_BEST_MODEL, streamingCallback = null) {
    console.log("LLM#generate");
    const anthropic = new Anthropic({
      apiKey: process.env["ANTHROPIC_API_KEY"]
    });
    const stream = anthropic.messages
      .stream({
        model: model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

    if (streamingCallback) {
      stream.on('text', streamingCallback);
    }

    const message = await stream.finalMessage();
    console.log(message);

    const response = message.content[0].text;
    this.saveLog(purpose, prompt, response);

    return response;
  }

  static async saveLog(purpose, prompt, response) {
    const fs = require('fs');
    const path = require('path');
    const promptDir = path.join(__dirname, "../logs/llm");
    if (!fs.existsSync(promptDir)) {
      fs.mkdirSync(promptDir, { recursive: true });
    }
    const promptFile = path.join(promptDir, new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).replace(/[\/\s:]/g, "-") + "_" + purpose + ".txt");
    const logContent = prompt + "\n======================================================================\n" + response;

    //logs/prompt/以下にpromptを保存
    try {
      fs.writeFileSync(promptFile, logContent);
    } catch (err) {
      console.error('Failed to write log locally:', err);
    }

    const google_drive_uploader = require('./google_drive_uploader');

    // サービスアカウントJSONファイルのパスとGoogle DriveのフォルダIDを指定
    const uploader = new google_drive_uploader('./src/kudamon-island-415b1eecb96d.json', '1kswavbd8zRz_ZTshlGQ2V7dE8IAX29gi');

    const fileName = `${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).replace(/[\/\s:]/g, '-')}_${purpose}.txt`;
    // const filePath = path.join(__dirname, fileName);

    // ファイルをアップロード
    uploader.uploadFile(logContent, fileName);

    // Save to S3
    const s3Params = {
      Bucket: `kudamon-island-${process.env.STAGE}`, // S3バケット名
      Key: `logs/${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).replace(/[\/\s:]/g, '-')}_${purpose}.txt`,
      Body: logContent,
      ContentType: 'text/plain'
    };

    try {
      s3.putObject(s3Params).promise();
      console.log('Log successfully saved to S3');
    } catch (err) {
      console.error('Failed to save log to S3:', err);
    }
  }
}

module.exports = LLM;
