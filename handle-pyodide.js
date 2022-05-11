let worker, ready;

function initializeWorker() {
  worker = new Worker('worker-pyodide.js');
  disableReady();
  worker.addEventListener('message', workerListenner);
}
window.addEventListener('load', (event) => {
  initializeWorker();
});

function disableReady() {
  ready = false;
  document.getElementById('run-button').innerHTML = '';
  document.getElementById('run-button').classList.remove('pushable');
}
function enableReady() {
  ready = true;
  document.getElementById('run-button').innerHTML = '実行';
  document.getElementById('run-button').classList.add('pushable');
}

let timer;

function run() {
  if (ready) {
    outputEditor.setValue('');
    disableReady();
    timer = setTimeout(cancelRunning, 10000);
    worker.postMessage([editor.getValue(), inputEditor.getValue()]);
  }
}

function workerListenner(msg) {
  enableReady();
  if (msg.data == 'ready') return;

  clearTimeout(timer);
  let formatedOutput = msg.data[0];
  let output = msg.data[1];
  outputEditor.setValue(formatedOutput);
  let err = [...formatedOutput.matchAll(/プログラムの (\d*) 行目/g)];
  if (err != null && err.length != 0) {
    let l = Number(err[err.length - 1][1]);
    editor.markers = [{
      startLineNumber: l,
      startColumn: 1,
      endLineNumber: l,
      endColumn: 1000,
      message: formatedOutput,
      severity: monaco.MarkerSeverity.Error,
    }];
    monaco.editor.setModelMarkers(editor.getModel(), 'message', editor.markers);
    outputEditor.setValue(
      formatedOutput
      + '\n=== エラー原文 ===\n'
      + output
      + '==================\n');
  }
  else {
    editor.markers = [];
    monaco.editor.setModelMarkers(editor.getModel(), 'message', editor.markers);
  }
}

function cancelRunning() {
  outputEditor.setValue('実行から 10 秒が経過したため処理を打ち切りました\n次に実行できるようになるまで数秒かかります');
  worker.terminate();
  initializeWorker();
}
