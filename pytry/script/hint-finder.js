import * as editor from './editor.js';
import * as logger from './logger.js';

let timer = null, previousHints = new Set([]);

/**
 * ヒント発見器の初期化を行う
 */
export function initialize() {
  editor.sourceChangeListenner.push(onDidChangeContent);
  timer = setTimeout(findHints, 3500);
}

function onDidChangeContent() {
  editor.clearSourceEditorMarker('Info');
  if (timer) clearTimeout(timer);
  timer = setTimeout(findHints, 2500);
}

/**
 * ソースに含まれるよくある誤りを発見して改善の提案を行う
 */
export function findHints() {
  const lines = editor.sourceEditor.getValue().split('\n');
  const hints = new Set([]);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let hint = '';

    addHint = (h) => {
      hint += h + '\n';
      if (!previousHints.has(hint)) {
        logger.log('hint_found', {
          line_number: logger.getCurrentLineNumber(),
          three_lines: logger.getCurrentThreeLines(),
          hint: h,
        });
      }
      hints.add(hint);
    };

    // コロン関連
    if (line.match(/^\s*if\s[^:]*$/g) !== null) {
      addHint(`${i + 1} 行目の「if 条件式:」の末尾のコロンを忘れていませんか？`);
    }
    if (line.match(/^\s*elif\s[^:]*$/g) !== null) {
      addHint(`${i + 1} 行目の「elif 条件式:」の末尾のコロンを忘れていませんか？`);
    }
    if (line.match(/^\s*elif\s*:/g) !== null) {
      addHint(`${i + 1} 行目は「elif 条件式:」か「else:」のいずれかではありませんか？`);
    }
    if (line.match(/^\s*else\s[^:]*$/g) !== null) {
      addHint(`${i + 1} 行目の「else:」の末尾のコロンを忘れていませんか？`);
    }
    if (line.match(/^\s*else\s[^:]+:$/g) !== null) {
      addHint(`${i + 1} 行目は「elif 条件式:」ではありませんか？`);
    }
    if (line.match(/^\s*for\s[^:]*$/g) !== null) {
      addHint(`${i + 1} 行目の「for 変数名 in 繰り返す内容:」の末尾のコロンを忘れていませんか？`);
    }
    if (line.match(/^\s*while\s[^:]*$/g) !== null) {
      addHint(`${i + 1} 行目の「while 条件式:」の末尾のコロンを忘れていませんか？`);
    }
    if (line.match(/^\s*if\s.*?:.+/g) !== null) {
      addHint(`${i + 1} 行目の「if 条件式:」の末尾のコロンの後に何か書かれています．条件式をすべて書いた後にコロンを書くと直りませんか？`);
    }
    if (line.match(/^\s*elif\s.*?:.+/g) !== null) {
      addHint(`${i + 1} 行目の「elif 条件式:」の末尾のコロンの後に何か書かれています．条件式をすべて書いた後にコロンを書くと直りませんか？`);
    }
    if (line.match(/^\s*while\s.*?:.+/g) !== null) {
      addHint(`${i + 1} 行目の「while 条件式:」の末尾のコロンの後に何か書かれています．条件式をすべて書いた後にコロンを書くと直りませんか？`);
    }

    // 比較演算子
    if (line.match(/=>/g) !== null) {
      addHint(`${i + 1} 行目の => は >= ではありませんか？`);
    }
    if (line.match(/=</g) !== null) {
      addHint(`${i + 1} 行目の =< は <= ではありませんか？`);
    }
    if (line.match(/=!/g) !== null) {
      addHint(`${i + 1} 行目の =! は != ではありませんか？`);
    }
    if (line.match(/!==/g) !== null) {
      addHint(`${i + 1} 行目の !== は != ではありませんか？`);
    }
    if (line.match(/>==/g) !== null) {
      addHint(`${i + 1} 行目の >== は >= ではありませんか？`);
    }
    if (line.match(/<==/g) !== null) {
      addHint(`${i + 1} 行目の <== は <= ではありませんか？`);
    }
    if (line.match(/<>/g) !== null) {
      addHint(`${i + 1} 行目の <> は != ではありませんか？`);
    }
    if (line.match(/(if|while)[^=]*=[^=]/g) !== null && line.match(/>=|<=|!=|=>|=<|=!/g) == null) {
      addHint(`${i + 1} 行目の = は == ではありませんか？`);
    }

    // その他
    if (line.match(/\w\[.{0,3}\,.{0,3}\]/g) !== null) {
      addHint(`${i + 1} 行目の [ ] の間のコンマ , はスライスのコロン : ではありませんか？`);
    }

    if (hint != '') {
      editor.addSourceEditorMarker(i + 1, `${hint}(この提案は間違っていることもあります)`, 'Info');
    }
  }
  previousHints = hints;
}
