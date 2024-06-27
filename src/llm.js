const Anthropic = require("@anthropic-ai/sdk");

class LLM {
  static CLAUDE_BEST_MODEL = "claude-3-5-sonnet-20240620";

  static async generate(gameId, prompt, model = CLAUDE_BEST_MODEL, streamingCallback = null) {
    console.log("LLM実行 prompt: " + prompt);

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

    /**
     message example:{
        id: 'msg_01BwXjbS4iQsKoL2vsmW9DVo',
        type: 'message',
        role: 'assistant',
        model: 'claude-3-opus-20240229',
        stop_sequence: null,
        usage: { input_tokens: 191, output_tokens: 16 },
        content: [ { type: 'text', text: '{ "background_image_number" : 3 }' } ],
        stop_reason: 'end_turn'
      }
    */
    const message = await stream.finalMessage();
    console.log(message);
    return message.content[0].text
  }
}

module.exports = LLM;