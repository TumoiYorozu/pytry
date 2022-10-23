importScripts('../modules/pyodide/pyodide.js');

const pyodideReadyPromise = initialize();

async function initialize() {
  const pyodide = await loadPyodide({
    indexURL: new URL('../modules/pyodide', location.href).toString(),
  });

  pyodide.runPython(await (await fetch('./py/compiler-initialize.py')).text());

  return pyodide;
}

async function compile(source, mode) {
  const pyodide = await pyodideReadyPromise;
  try {
    pyodide.FS.writeFile('/source.py', source, { encoding: 'utf8' });
    let res = await pyodide.runPython(`compile_code()`);
    res = res.replaceAll(
      /Traceback \(most recent call last\):\n[\s\S]*  File "\/source.py", line (\d*).*\n/g,
      `Traceback (most recent call last):
  File "Main.py", line $1
`);
    self.postMessage({
      error: res,
      mode: mode
    });
  } catch (e) {
    console.log(e);
  }
}

self.addEventListener('message', (message) => {
  compile(message.data.source, message.data.mode);
});
