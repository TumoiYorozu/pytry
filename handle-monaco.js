var editor, session, inputEditor, inputSession, outputEditor, outputSession;

window.addEventListener('load', (event) => {
  require.config({
    paths: {
      'vs': './monaco-editor/min/vs'
    },
    'vs/nls': {
      availableLanguages: { '*': 'ja' }
    }
  });

  source_text = 'a = int(input())\nb = int(input())\nprint(a + b)\n';
  input_text = '7\n5\n';
  output_text = '';
  if (localStorage.getItem('source_text') != null) {
    source_text = decodeURIComponent(localStorage.getItem('source_text'));
  }
  if (localStorage.getItem('input_text') != null) {
    input_text = decodeURIComponent(localStorage.getItem('input_text'));
  }
  if (localStorage.getItem('output_text') != null) {
    output_text = decodeURIComponent(localStorage.getItem('output_text'));
  }

  require(['vs/editor/editor.main'], function () {
    monaco.languages.registerOnTypeFormattingEditProvider('python', new PyTryOnTypeFormattingEditProvider());

    session = monaco.editor.createModel(source_text, 'python');
    editor = monaco.editor.create(document.getElementById('editor'), {
      minimap: { enabled: false },
      automaticLayout: true,
      renderControlCharacters: true,
      fontSize: 20,
      wordWrap: true,
      renderIndentGuides: true,
      scrollBeyondLastLine: false,
      folding: false,
      'bracketPairColorization.enabled': true,
      lineDecorationsWidth: 30,
      unicodeHighlight: {
        nonBasicASCII: true,
      },
      renderWhitespace: 'all',
      formatOnType: true,
    });
    editor.setModel(session);
    session.onDidChangeContent((event) => {
      localStorage.setItem('source_text', encodeURIComponent(editor.getValue()));
    });

    inputSession = monaco.editor.createModel(input_text, 'text');
    inputEditor = monaco.editor.create(document.getElementById('input'), {
      minimap: { enabled: false },
      automaticLayout: true,
      renderControlCharacters: true,
      fontSize: 20,
      wordWrap: true,
      scrollBeyondLastLine: false,
      folding: false,
      lineDecorationsWidth: 30,
      renderIndentGuides: false,
    });
    inputEditor.setModel(inputSession);
    inputSession.onDidChangeContent((event) => {
      localStorage.setItem('input_text', encodeURIComponent(inputEditor.getValue()));
    });

    outputSession = monaco.editor.createModel(output_text, 'text');
    outputEditor = monaco.editor.create(document.getElementById('output'), {
      minimap: { enabled: false },
      automaticLayout: true,
      renderControlCharacters: true,
      fontSize: 20,
      wordWrap: true,
      scrollBeyondLastLine: false,
      folding: false,
      lineDecorationsWidth: 30,
      renderIndentGuides: false,
      readOnly: true,
    });
    outputEditor.setModel(outputSession);
    outputSession.onDidChangeContent((event) => {
      localStorage.setItem('output_text', encodeURIComponent(outputEditor.getValue()));
    });
  });

  setInterval(function () {
    const highlighter = document.getElementById('highlighter');
    highlighter.innerHTML = '';

    const tags = document.getElementsByTagName('span');
    const patterns = [
      ['list', '(', 'map', '(', 'int', ',', '·', 'input', '(', ')', '.split', '(', ')', ')', ')'],
      ['map', '(', 'int', ',', '·', 'input', '(', ')', '.split', '(', ')', ')'],
      ['int', '(', 'input', '(', ')', ')'],
      ['input', '(', ')'],
    ];

    for (let i = 0; i < tags.length; i++) {
      for (const pattern of patterns) {
        let ok = true;
        for (let j = 0; j < pattern.length; j++) {
          ok &= i + j < tags.length && pattern[j] == tags[i + j].innerHTML;
        }
        if (ok) {
          const left = window.pageXOffset + tags[i].getBoundingClientRect().left;
          const top = window.pageYOffset + tags[i].getBoundingClientRect().top;
          const right = window.pageXOffset + tags[i + pattern.length - 1].getBoundingClientRect().right;
          const bottom = window.pageYOffset + tags[i + pattern.length - 1].getBoundingClientRect().bottom;
          highlighter.innerHTML += `<span class="stdin-highlight" style="left: ${left}px; top: ${top}px; width: ${right - left}px; height: ${bottom - top}px;"></span>`;
          i += pattern.length - 1;
          break;
        }
      }
    }
  }, 10);
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
  }
});

function copyFromSource() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(editor.getValue());
  }
}

function pasteToInput() {
  if (navigator.clipboard) {
    navigator.clipboard.readText()
      .then(function (text) {
        inputEditor.setValue(text);
      });
    inputEditor.focus();
  }
}

function insert_int_input() {
  editor.pushUndoStop();
  const selection = editor.getSelection();
  const id = { major: 1, minor: 1 };
  const text = 'int(input())';
  const op = { identifier: id, range: selection, text: text, forceMoveMarkers: true };
  editor.executeEdits('insertion-helper', [op]);
  editor.focus();
}

function insert_map_int_input_split() {
  editor.pushUndoStop();
  const selection = editor.getSelection();
  const id = { major: 1, minor: 1 };
  const text = 'map(int, input().split())';
  const op = { identifier: id, range: selection, text: text, forceMoveMarkers: true };
  editor.executeEdits('insertion-helper', [op]);
  editor.focus();
}

function insert_input() {
  editor.pushUndoStop();
  const selection = editor.getSelection();
  const id = { major: 1, minor: 1 };
  const text = 'input()';
  const op = { identifier: id, range: selection, text: text, forceMoveMarkers: true };
  editor.executeEdits('insertion-helper', [op]);
  editor.focus();
}

function insert_list_map_int_input_split() {
  editor.pushUndoStop();
  const selection = editor.getSelection();
  const id = { major: 1, minor: 1 };
  const text = 'list(map(int, input().split()))';
  const op = { identifier: id, range: selection, text: text, forceMoveMarkers: true };
  editor.executeEdits('insertion-helper', [op]);
  editor.focus();
}