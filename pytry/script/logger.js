import * as editor from './editor.js';

const url = 'https://ktmr.vsw.jp/pytry/log.cgi';
const maxLength = 5000;
const maxLengthGa = 80;

let userId = null;
let sessionId = null;

function send(event_name, params) {
  for (let key in params)
    if (typeof params[key] == 'string')
      params[key] = params[key].substr(0, maxLength);

  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(Object.assign({
      user_id: userId,
      session_id: sessionId,
      event_name: event_name,
    }, params)),
  };
  console.log(request.body);

  fetch(url, request)
    .then(response => response.json())
    .then(json => {
      if (!json.status) {
        console.log(`${json.result}`);
      }
    })
    .catch(error => {
      console.log(`${error}`);
    });
}

function ga(event_name, params) {
  for (let key in params)
    if (typeof params[key] == 'string')
      params[key] = params[key].substr(0, maxLengthGa);

  gtag('event', event_name, Object.assign({
    user_id: userId,
    session_id: sessionId,
    event_name: event_name,
  }, params));
}

/**
 * ロガーの初期化を行い，独自解析システムにログを送信する
 */
export function initizalize() {
  sessionId = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))).substring(0, 16);
  if (localStorage.getItem('user_id') !== null) {
    userId = decodeURIComponent(localStorage.getItem('user_id'));
  }
  else {
    userId = sessionId;
    localStorage.setItem('user_id', encodeURIComponent(userId));
  }
  send('view', {});
}

/**
 * 独自解析システム及び GA4 の両方にログを送信する
 * @param {string} event_name イベント名
 * @param {*} params パラメータ
 */
export function log(event_name, params) {
  for (let key in params)
    if (typeof params[key] == 'string')
      params[key] = params[key].replaceAll('\r', '');
  send(event_name, params);
  ga(event_name, params);
}

/**
 * 
 * @returns ソースエディタのカーソルがある行の行番号
 */
export function getCurrentLineNumber() {
  const selection = editor.sourceEditor.getSelection();
  return selection.positionLineNumber;
}

/**
 * 
 * @returns ソースエディタのカーソルがある行のテキスト
 */
export function getCurrentLine() {
  const lineNumber = getCurrentLineNumber() - 1;
  const source = editor.sourceEditor.getValue();
  return source.split('\n')[lineNumber].trimEnd();
}

/**
 * 
 * @returns 指定行の前後 3 行のテキスト
 */
export function getThreeLines(lineNumber) {
  const source = '\n' + editor.sourceEditor.getValue() + '\n';
  let res = '';
  res += source.split('\n')[lineNumber - 1].trimEnd() + '\n';
  res += source.split('\n')[lineNumber].trimEnd() + '\n';
  res += source.split('\n')[lineNumber + 1].trimEnd() + '\n';
  return res;
}
