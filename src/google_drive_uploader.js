const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDriveUploader {
  constructor(keyFilePath, folderId) {
    this.keyFilePath = keyFilePath;
    this.folderId = folderId;
  }

  async authenticate() {
    // サービスアカウントの認証情報を使用して認証
    this.auth = new google.auth.GoogleAuth({
      keyFile: this.keyFilePath,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  async uploadFile(fileContentString, fileName) {
    // 認証が未完了の場合に認証を実行
    if (!this.drive) {
      await this.authenticate();
    }

    const fileMetadata = {
      name: fileName,
      parents: [this.folderId], // 共有したGoogle DriveフォルダのID
    };

    const media = {
      mimeType: 'text/plain',
      body: fileContentString,
    };

    try {
      const file = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });
      console.log('File successfully uploaded to Google Drive:', file.data.id);
    } catch (error) {
      console.error('Failed to upload file to Google Drive:', error);
    }
  }
}

module.exports = GoogleDriveUploader;
