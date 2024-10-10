const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Common = require('../common');

exports.handler = async (event) => {
    const fileName = event.queryStringParameters.fileName; // クライアントからファイル名を受け取る
    const fileType = event.queryStringParameters.fileType; // クライアントからファイルタイプを受け取る

    const params = {
        Bucket: `kudamon-island-${process.env.STAGE}`, // S3バケット名
        Key: fileName,                 // S3に保存するファイル名
        Expires: 60,                   // URLの有効期限（秒）
        ContentType: fileType          // ファイルのコンテンツタイプ
    };

    try {
        const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
        return {
            statusCode: 200,
            headers: Common.DEFAULT_HEADERS,
            body: uploadUrl
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: Common.DEFAULT_HEADERS,
            body: JSON.stringify({ error: 'Error generating upload URL' })
        };
    }
};
