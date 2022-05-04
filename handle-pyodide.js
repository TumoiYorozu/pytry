async function load() {
  let pyodide = await loadPyodide({
    indexURL: location.href + '/pyodide',
  });
  await pyodide.loadPackage('numpy');
  await pyodide.runPython(`
import io, sys, traceback

def __run(code, input):
    my_in = io.StringIO(input)
    my_out = io.StringIO()
    oldin = sys.stdin
    oldout = sys.stdout
    olderr = sys.stderr
    sys.stdin = my_in
    sys.stdout = sys.stderr = my_out
    try:
        exec(code, {})
    except:
        traceback.print_exc()
    sys.stdin = oldin
    sys.stdout = oldout
    sys.stderr = olderr
    return my_out.getvalue()`);
  return pyodide;
}
let pyodideReadyPromise = load();

async function run() {
  let pyodide = await pyodideReadyPromise;
  try {
    pyodide.globals.set("__code_to_run", editor.getValue());
    pyodide.globals.set("__input_to_read", inputEditor.getValue().replaceAll(/\r/g, ""));
    let output = await pyodide.runPython('__run(__code_to_run, __input_to_read)');
    output = output.replaceAll(/(.*)File "<exec>"(.*)\n/g, "");
    output = output.replaceAll(/(.*)File "<string>", line (\d*)(.*)\n/g, '$1File "Main.py", line $2$3\n');
    let formatedOutput = formatOutput(output);
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
  } catch (err) {
    console.log(err);
    outputEditor.setValue("PyTry 内部でエラーが発生しました");
  }
}

function formatOutput(output) {
  output = output.replaceAll('Traceback (most recent call last):\n', 'エラー発生:\n');
  output = output.replaceAll(/(.*)File "Main.py", line (\d*)(.*)\n/g, '$1プログラムの $2 行目\n');
  output = output.replaceAll('ZeroDivisionError: division by zero', 'ZeroDivisionError: ゼロで割ろうとしました\n');
  output = output.replaceAll(/NameError: name '(.*)' is not defined/g, "NameError: 「$1」が見つかりません\n");
  output = output.replaceAll('SyntaxError: invalid syntax', 'SyntaxError: 文法が間違っています\n');
  outputEditor.setValue(output);
  output = output.replaceAll('IndentationError: unindent does not match any outer indentation level', 'IndentationError: インデントが揃っていません\n');
  output = output.replaceAll(/ValueError: invalid literal for int\(\) with base 10: '(.*)'/g, "ValueError: 「$1」を整数に変換できません (入力欄が正しくないことがあります)\n");
  output = output.replaceAll('IndexError: list index out of range', 'IndexError: リストのサイズ以上の添え字の要素にアクセスしようとしました\n');
  output = output.replaceAll(/KeyError: '(.*)'/g, 'KeyError: キー「$1」は存在しません\n');
  output = output.replaceAll('EOFError: EOF when reading a line', 'ファイルの末尾に到達しました (入力欄が正しくないことがあります)\n');
  return output;
}