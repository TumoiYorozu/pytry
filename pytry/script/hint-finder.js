/**
 * ソースに含まれるよくある誤りを発見して改善の提案を行う
 * @param {*} source ソース
 * @returns ソースから発見された提案
 */
export function findHints(source) {
  let res = '';
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // コロン関連
    if (line.match(/^\s*if\s[^:]*$/g) !== null) {
      res += `${i + 1} 行目の「if 条件式:」の末尾のコロンを忘れていませんか？\n`;
    }
    if (line.match(/^\s*elif\s[^:]*$/g) !== null) {
      res += `${i + 1} 行目の「elif 条件式:」の末尾のコロンを忘れていませんか？\n`;
    }
    if (line.match(/^\s*elif\s*:/g) !== null) {
      res += `${i + 1} 行目は「elif 条件式:」か「else:」のいずれかではありませんか？\n`;
    }
    if (line.match(/^\s*else\s[^:]*$/g) !== null) {
      res += `${i + 1} 行目の「else:」の末尾のコロンを忘れていませんか？\n`;
    }
    if (line.match(/^\s*else\s[^:]+:$/g) !== null) {
      res += `${i + 1} 行目は「elif 条件式:」ではありませんか？\n`;
    }
    if (line.match(/^\s*for\s[^:]*$/g) !== null) {
      res += `${i + 1} 行目の「for 変数名 in range(繰り返し回数):」の末尾のコロンを忘れていませんか？\n`;
    }
    if (line.match(/^\s*while\s[^:]*$/g) !== null) {
      res += `${i + 1} 行目の「while 条件式:」の末尾のコロンを忘れていませんか？\n`;
    }
    if (line.match(/^\s*if\s.*?:.+/g) !== null) {
      res += `${i + 1} 行目の「if 条件式:」の末尾のコロンの後に何か書かれています．条件式をすべて書いた後にコロンを書くと直りませんか？\n`;
    }
    if (line.match(/^\s*elif\s.*?:.+/g) !== null) {
      res += `${i + 1} 行目の「elif 条件式:」の末尾のコロンの後に何か書かれています．条件式をすべて書いた後にコロンを書くと直りませんか？\n`;
    }
    if (line.match(/^\s*while\s.*?:.+/g) !== null) {
      res += `${i + 1} 行目の「while 条件式:」の末尾のコロンの後に何か書かれています．条件式をすべて書いた後にコロンを書くと直りませんか？\n`;
    }

    // 比較演算子
    if (line.match(/=>/g) !== null) {
      res += `${i + 1} 行目の => は >= ではありませんか？\n`;
    }
    if (line.match(/=</g) !== null) {
      res += `${i + 1} 行目の =< は <= ではありませんか？\n`;
    }
    if (line.match(/=!/g) !== null) {
      res += `${i + 1} 行目の =! は != ではありませんか？\n`;
    }
    if (line.match(/!==/g) !== null) {
      res += `${i + 1} 行目の !== は != ではありませんか？\n`;
    }
    if (line.match(/>==/g) !== null) {
      res += `${i + 1} 行目の >== は >= ではありませんか？\n`;
    }
    if (line.match(/<==/g) !== null) {
      res += `${i + 1} 行目の <== は <= ではありませんか？\n`;
    }
    if (line.match(/<>/g) !== null) {
      res += `${i + 1} 行目の <> は != ではありませんか？\n`;
    }
    if (line.match(/(if|while)[^=]*=[^=]/g) !== null && line.match(/>=|<=|!=|=>|=<|=!/g) == null) {
      res += `${i + 1} 行目の = は == ではありませんか？\n`;
    }

    // その他
    if (line.match(/\S\[.*\,.*\]/g) !== null) {
      res += `${i + 1} 行目の [ ] の間のコンマ , はスライスのコロン : ではありませんか？\n`;
    }
  }
  if (res == '') return '';
  return `提案：\n${res}(提案は間違っていることもあります)\n`;
}
