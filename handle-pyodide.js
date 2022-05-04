const worker = new Worker('worker-pyodide.js');

function run() {
  outputEditor.setValue("実行中...");
  worker.postMessage([editor.getValue(), inputEditor.getValue()]);
}

worker.addEventListener('message', (msg) => {
  let formatedOutput = msg.data;
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
      + "\n=== エラー原文 ===\n"
      + output
      + "==================\n");
  }
  else {
    editor.markers = [];
    monaco.editor.setModelMarkers(editor.getModel(), 'message', editor.markers);
  }
});
