import * as editor from './editor.js';
import * as errorTranslator from './error-translator.js';
import * as hintFinder from './hint-finder.js';

let worker, isReady, timeoutTimer, runButtonId;

/**
 * Python 実行環境の初期化を行う
 * @param {string} _runButtonId 実行ボタンの id
 */
export function initialize(_runButtonId) {
  runButtonId = _runButtonId;
  initializeWorker();
}

function initializeWorker() {
  disableReady();
  worker = new Worker('./script/runner-worker.js');
  worker.addEventListener('message', workerListenner);
}

function disableReady() {
  isReady = false;
  document.getElementById(runButtonId).innerHTML = '<div class="loader-inner ball-pulse"><div></div><div></div><div></div></div>';
  document.getElementById(runButtonId).classList.remove('pushable');
}

function enableReady() {
  isReady = true;
  document.getElementById(runButtonId).innerHTML = '実行';
  document.getElementById(runButtonId).classList.add('pushable');
}

/**
 * ソースを実行する
 */
export async function run() {
  if (!isReady) return;

  disableReady();

  editor.clearSourceEditorMarker('Error');
  editor.clearSourceEditorDecoration();
  editor.clearOutputEditor();

  timeoutTimer = setTimeout(timeout, 10000);
  worker.postMessage({
    source: editor.sourceEditor.getValue(),
    stdin: editor.inputEditor.getValue().replaceAll('\r', '')
  });
}

function workerListenner(message) {
  const kind = message.data.kind;
  const content = message.data.content;

  if (kind == 'initialized') {
    enableReady();
  }

  if (kind == 'done') {
    if (timeoutTimer) clearTimeout(timeoutTimer);
    enableReady();
  }

  if (kind == 'stdout') {
    editor.addToOutputEditor(content);
  }

  if (kind == 'error') {
    const translated = errorTranslator.translate(content);
    editor.addToOutputEditor(`${translated}
${hintFinder.findHints(editor.sourceEditor.getValue())}`);

    let err = [...translated.matchAll(/プログラムの (\d*) 行目/g)];
    if (err != null && err.length != 0) {
      let lineNumber = Number(err[err.length - 1][1]);
      editor.addSourceEditorMarker(lineNumber, translated, 'Error');
      editor.addSourceEditorDecoration(lineNumber, 'glyphMarginError');
    }
  }

  if (kind == 'internalError') {
    editor.addToOutputEditor(content);

    if (timeoutTimer) clearTimeout(timeoutTimer);
    enableReady();
  }
}

function timeout() {
  editor.addToOutputEditor(`実行から 10 秒が経過したため処理を打ち切りました
次に実行できるようになるまで数秒かかります
この表示が現れる主な原因は次の通りです：
1. 無限ループが発生している (while 文の条件式などが間違っていないか確認しましょう)
2. 解法の効率が悪い (時間計算量を見積もりましょう)
`);
  worker.terminate();
  initializeWorker();
}
