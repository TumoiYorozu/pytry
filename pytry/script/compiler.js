import * as editor from './editor.js';
import * as errorTranslator from './error-translator.js';

let worker, timer = null, previousError = '';

/**
 * コンパイラの初期化を行う
 */
export function initialize() {
  editor.sourceChangeListenner.push(onDidChangeContent);
  worker = new Worker('./script/compiler-worker.js');
  worker.addEventListener('message', workerListenner);
  timer = setTimeout(timerHandler, 3000);
}

function onDidChangeContent() {
  startCompilation(false);
  if (timer) clearTimeout(timer);
  timer = setTimeout(timerHandler, 2000);
}

function timerHandler() {
  startCompilation(true);
}

function startCompilation(doesDetectError) {
  worker.postMessage({
    source: editor.sourceEditor.getValue(),
    mode: doesDetectError
  });
}

function workerListenner(message) {
  const error = message.data.error;
  const doesDetectError = message.data.mode;

  if (!doesDetectError) {
    if (error == '' || error != previousError) {
      editor.clearSourceEditorMarker('Warning');
    }
  }
  else {
    const translated = errorTranslator.translate(error);
    let err = [...translated.matchAll(/プログラムの (\d*) 行目/g)];
    if (err != null && err.length != 0) {
      let lineNumber = Number(err[err.length - 1][1]);
      editor.addSourceEditorMarker(lineNumber, translated, 'Warning');
    }
  }

  previousError = error;
}
