const axios = require('axios');
// const AWS = require('aws-sdk');
// require('aws-sdk/lib/maintenance_mode_message').suppress = true;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// async function sendRequest(functionUrl, query) {
//   try {
//     const response = await axios.post(functionUrl, query);
//     console.log('Request successful:', response.data);
//     await delay(1000); // 1秒待つ
//   } catch (error) {
//     // エラー処理
//   }
// }

module.exports.handler = async (event) => {
  const rpgPrompt = event?.queryStringParameters?.prompt;
  const language = event?.queryStringParameters?.language;

  const isOffline = !!process.env.IS_OFFLINE;
  const functionUrl = isOffline ?
    'http://localhost:3000/dev/start_game' :
    'https://lhpnlnb3f6.execute-api.ap-northeast-1.amazonaws.com/dev/start_game';

  const gameIds = [];

  try {
    const defaultTryCount = 10;
    const tryCount = event?.queryStringParameters?.count || defaultTryCount;
    for (let i = 0; i < tryCount; i++) {
      const randomInt = Math.floor(Math.random() * 9000) + 1000;
      
      const gameId = new Date().getTime() + randomInt.toString();  
      gameIds.push(gameId);
      query = {
        "prompt": `${rpgPrompt}`,
        "gameId": `${gameId}`,
        "language":`${language}`
      };
      console.log(functionUrl);
      console.log(query);
      console.log("axios.post");
      axios.post(functionUrl, query)
        .then(response => {
          // リクエストが成功した場合の処理
          console.log('Request successful:', response.data);
          // 必要に応じて、レスポンスデータを処理するロジックを追加
        })
        .catch(error => {
          console.log('Request failed:', error);
          // エラーが発生した場合の処理
          if (error.response) {
            // サーバーからのレスポンスがあるエラーの場合
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
          } else if (error.request) {
            // リクエストが送信されたが、レスポンスがない場合
            console.error('No response received:', error.request);
          } else {
            // リクエストの設定中に発生したエラーの場合
            console.error('Error setting up the request:', error.message);
          }
        });

      if (!isOffline) {
        await delay(100); // AWS lambdaだと少しdelayしないと上のpostが実行されないので待つ
      }
    }

  } catch (error) {
    console.error("Error executing AI:", error);
    throw error;
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    body: JSON.stringify({
      message: `"${rpgPrompt}"のRPG生成指示を受け付けました: ${new Date().
      toLocaleString('ja-JP')}`,
      gameId: gameIds[0]
    }),
  };
};
