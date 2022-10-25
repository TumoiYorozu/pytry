export let sourceEditor, inputEditor, outputEditor;
export let sourceSession, inputSession, outputSession;
export let sourceChangeListenner = [];
let decorationsCollection = [];

/**
 * エディタの初期化を行う
 * @param {string} sourceEditorId ソースエディタの id
 * @param {string} inputEditorId インプットエディタの id
 * @param {string} outputEditorId アウトプットエディタの id
 */
export function initialize(sourceEditorId, inputEditorId, outputEditorId) {
  require.config({
    paths: {
      'vs': './modules/monaco-editor/min/vs'
    },
    'vs/nls': {
      availableLanguages: { '*': 'ja' }
    }
  });

  let sourceText = 'a = int(input())\nb = int(input())\nprint(a + b)\n';
  let inputText = '7\n5\n';
  let outputText = '';
  if (localStorage.getItem('source_text') != null) {
    sourceText = decodeURIComponent(localStorage.getItem('source_text'));
  }
  if (localStorage.getItem('input_text') != null) {
    inputText = decodeURIComponent(localStorage.getItem('input_text'));
  }
  if (localStorage.getItem('output_text') != null) {
    outputText = decodeURIComponent(localStorage.getItem('output_text'));
  }

  require(['vs/editor/editor.main'], function () {
    // monaco.languages.registerOnTypeFormattingEditProvider('python', new PyTryOnTypeFormattingEditProvider());

    sourceSession = monaco.editor.createModel(sourceText, 'python');
    sourceEditor = monaco.editor.create(document.getElementById(sourceEditorId), {
      // 共通設定
      minimap: { enabled: false },
      automaticLayout: true,
      renderControlCharacters: true,
      fontSize: 18,
      wordWrap: true,
      scrollBeyondLastLine: false,
      folding: false,
      lineDecorationsWidth: 30,
      fontFamily: "'UDEV Gothic JPDOC', monospace",
      // ソースエディタ専用設定
      renderIndentGuides: true,
      unicodeHighlight: {
        nonBasicASCII: true,
      },
      'bracketPairColorization.enabled': true,
      renderWhitespace: 'all',
      formatOnType: true,
      glyphMargin: true,
    });
    sourceEditor.setModel(sourceSession);
    sourceSession.onDidChangeContent((event) => {
      localStorage.setItem('source_text', encodeURIComponent(sourceEditor.getValue()));
      if (event.changes[0].text.includes('\n')) {
        clearSourceEditorDecoration();
        clearSourceEditorMarker('Error');
      }
      for (const listenner of sourceChangeListenner) {
        listenner();
      }
    });

    inputSession = monaco.editor.createModel(inputText, 'text');
    inputEditor = monaco.editor.create(document.getElementById(inputEditorId), {
      // 共通設定
      minimap: { enabled: false },
      automaticLayout: true,
      renderControlCharacters: true,
      fontSize: 18,
      wordWrap: true,
      scrollBeyondLastLine: false,
      folding: false,
      lineDecorationsWidth: 30,
      fontFamily: "'UDEV Gothic JPDOC', monospace",
      // インプットエディタ専用設定
      renderIndentGuides: false,
    });
    inputEditor.setModel(inputSession);
    inputSession.onDidChangeContent((event) => {
      localStorage.setItem('input_text', encodeURIComponent(inputEditor.getValue()));
    });

    outputSession = monaco.editor.createModel(outputText, 'text');
    outputEditor = monaco.editor.create(document.getElementById(outputEditorId), {
      // 共通設定
      minimap: { enabled: false },
      automaticLayout: true,
      renderControlCharacters: true,
      fontSize: 18,
      wordWrap: true,
      scrollBeyondLastLine: false,
      folding: false,
      lineDecorationsWidth: 30,
      fontFamily: "'UDEV Gothic JPDOC', monospace",
      // アウトプットエディタ専用設定
      renderIndentGuides: false,
      unicodeHighlight: {
        nonBasicASCII: false,
        ambiguousCharacters: false,
      },
    });
    outputEditor.setModel(outputSession);
    outputSession.onDidChangeContent((event) => {
      localStorage.setItem('output_text', encodeURIComponent(outputEditor.getValue()));
    });
  });

  const editorDom = document.getElementById(sourceEditorId);
  const obs = new MutationObserver(updateStdinHighlight);
  obs.observe(editorDom, {
    childList: true,
    characterData: true,
    characterDataOldValue: true,
    attributes: true,
    subtree: true,
  });
  updateStdinHighlight();
}

export function copy_from_source() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(sourceEditor.getValue());
  }
}

export function paste_to_input() {
  if (navigator.clipboard) {
    navigator.clipboard.readText()
      .then((text) => {
        inputEditor.setValue(text);
      });
    inputEditor.focus();
  }
}

export function insert_int_input() {
  insertToSourceEditor('int(input())');
}

export function insert_map_int_input_split() {
  insertToSourceEditor('map(int, input().split())');
}

export function insert_input() {
  insertToSourceEditor('input()');
}

export function insert_list_map_int_input_split() {
  insertToSourceEditor('list(map(int, input().split()))');
}

function insertToSourceEditor(text) {
  sourceEditor.pushUndoStop();
  const selection = sourceEditor.getSelection();
  const id = { major: 1, minor: 1 };
  const op = { identifier: id, range: selection, text: text, forceMoveMarkers: true };
  sourceEditor.executeEdits('insertion-helper', [op]);
  sourceEditor.focus();
}

function updateStdinHighlight() {
  const editorElement = document.getElementById('source-editor');
  const editorLeft = window.pageXOffset + editorElement.getBoundingClientRect().left;
  const editorTop = window.pageYOffset + editorElement.getBoundingClientRect().top;
  const editorRight = window.pageXOffset + editorElement.getBoundingClientRect().right;
  const editorBottom = window.pageYOffset + editorElement.getBoundingClientRect().bottom;

  const highlightElement = document.getElementById('highlight');
  highlightElement.innerHTML = '';
  highlightElement.style.left = editorLeft + 'px';
  highlightElement.style.top = editorTop + 'px';
  highlightElement.style.width = (editorRight - editorLeft) + 'px';
  highlightElement.style.height = (editorBottom - editorTop) + 'px';

  const tags = Array.from(document.getElementsByTagName('span')).filter(tag => tag.childNodes.length == 1 && tag.childNodes[0].nodeType == 3);
  const patterns = [
    ['list', '(', 'map', '(', 'int', ',', '·', 'input', '(', ')', '.', 'split', '(', ')', ')', ')'],
    ['list', '(', 'map', '(', 'int', ',', '·', 'input', '(', ')', '.split', '(', ')', ')', ')'],
    ['map', '(', 'int', ',', '·', 'input', '(', ')', '.', 'split', '(', ')', ')'],
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
        const top = window.pageYOffset + tags[i].getBoundingClientRect().top - editorTop + 1;
        const bottom = window.pageYOffset + tags[i].getBoundingClientRect().bottom - editorTop;
        for (let j = 0; j < pattern.length; j++) {
          const left = window.pageXOffset + tags[i + j].getBoundingClientRect().left - editorLeft;
          const right = window.pageXOffset + tags[i + j].getBoundingClientRect().right - editorLeft;
          let classes = 'stdin-highlight';
          if (j == 0) {
            classes += ' stdin-highlight-left';
          }
          if (j == pattern.length - 1) {
            classes += ' stdin-highlight-right';
          }
          highlightElement.innerHTML += `<span class="${classes}" style="left: ${left}px; top: ${top}px; width: ${right - left}px; height: ${bottom - top}px;"></span>`;
        }
        i += pattern.length - 1;
        break;
      }
    }
  }
}

export function clearOutputEditor() {
  outputEditor.setValue('');
  outputEditor.revealLine(0);
}

export function addToOutputEditor(text) {
  outputEditor.setValue(outputEditor.getValue() + text);
}

export function clearSourceEditorMarker(mode) {
  sourceEditor.markers = [];
  monaco.editor.setModelMarkers(sourceEditor.getModel(), mode, sourceEditor.markers);
}

export function addSourceEditorMarker(lineNumber, message, mode) {
  sourceEditor.markers = [{
    startLineNumber: lineNumber,
    startColumn: 1,
    endLineNumber: lineNumber,
    endColumn: 1000,
    message: message,
    severity: mode == 'Error' ? monaco.MarkerSeverity.Error : mode == 'Warning' ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Info,
  }];
  monaco.editor.setModelMarkers(sourceEditor.getModel(), mode, sourceEditor.markers);
}

export function clearSourceEditorDecoration() {
  if (decorationsCollection !== []) {
    decorationsCollection = sourceEditor.deltaDecorations(
      decorationsCollection,
      []
    );
  }
}

export function addSourceEditorDecoration(lineNumber, glyphMarginClassName) {
  decorationsCollection = sourceEditor.deltaDecorations(
    [],
    [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber, 1000),
        options: {
          isWholeLine: true,
          glyphMarginClassName: glyphMarginClassName
        }
      }
    ]
  );
}
