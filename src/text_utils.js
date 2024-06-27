class TextUtils {
  static processText(inputText) {
      // 文字列全体の最初と最後に改行があったら消す
      inputText = inputText.trim();

      // 改行が複数連なっていたら1つにする
      inputText = inputText.replace(/(\r?\n)+/g, '\n');

      // 「」の中のテキストを一時的に保護するためにプレースホルダーに置き換える
      const matches = inputText.match(/「.*?」/g);
      let counter = 0;
      const placeholders = {};
      if (matches) {
          matches.forEach(match => {
              const placeholder = `__PLACEHOLDER_${counter}__`;
              placeholders[placeholder] = match;
              inputText = inputText.replace(match, placeholder);
              counter++;
          });
      }

      // 。の後に改行がなければ入れる
      inputText = inputText.replace(/。(?!\n)/g, '。\n');

      // プレースホルダーを元のテキストに戻す
      for (const placeholder in Object.keys(placeholders)) {
          inputText = inputText.replace(placeholder, placeholders[placeholder]);
      }

      // 」の後に改行がなければ入れる
      inputText = inputText.replace(/」(?!\n)/g, '」\n');

      return inputText;
  }

  static splitTexts(inputText) {
    return inputText.split('\n').filter(x => x.trim() !== '');
  }
}

module.exports = TextUtils;
