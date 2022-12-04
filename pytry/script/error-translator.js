export let lastTranslationSuccess = '';

/**
 * 専門的な英語のエラーメッセージをわかりやすい日本語に変換して返す
 * @param {*} originalErrorMessage Python が出力した元のエラーメッセージ
 * @returns わかりやすい日本語のエラーメッセージ
 */
export function translate(originalErrorMessage) {
  if (originalErrorMessage == '') return '';

  let translated = originalErrorMessage;

  // 基本
  translated = translated.replaceAll('Traceback (most recent call last):', 'エラー発生:');
  translated = translated.replaceAll(/(.*)File "Main.py", line (\d*)(.*)/g, '$1プログラムの $2 行目');

  const basicTranslated = translated;

  // インデント
  translated = translated.replaceAll(/IndentationError: expected an indented block after '(.*)' statement on line (.*)/g, '$2 行目の $1 文の後にインデントされた部分が必要です');
  translated = translated.replaceAll('IndentationError: expected an indented block', 'インデントを忘れています');
  translated = translated.replaceAll('IndentationError: unexpected indent', 'インデントがおかしな位置にあります');
  translated = translated.replaceAll('IndentationError: unindent does not match any outer indentation level', 'インデントが揃っていません');
  translated = translated.replaceAll('SyntaxError: invalid non-printable character U+3000', '全角スペースが紛れ込んでいます (半角スペース 2 個に直しましょう)');
  translated = translated.replaceAll('TabError: inconsistent use of tabs and spaces in indentation', 'インデントでタブと半角スペースが混ざっています');

  // 入出力
  translated = translated.replaceAll(/ValueError: invalid literal for int\(\) with base 10: '(.*)'/g, '「$1」を整数に変換できません (入力の受け取り方や入力欄が正しくないことがあります)');
  translated = translated.replaceAll(/ValueError: not enough values to unpack \(expected (.*), got (.*)\)/g, '$2 個しかないデータを $1 個に分けようとしました (入力の受け取り方や入力欄が正しくないことがあります)');
  translated = translated.replaceAll(/ValueError: too many values to unpack \(expected (.*)\)/g, '$1 個より多いデータを $1 個に分けようとしました (入力の受け取り方や入力欄が正しくないことがあります)');
  translated = translated.replaceAll('EOFError: EOF when reading a line', 'ファイルの末尾に到達しました (入力の受け取り方や入力欄が正しくないことがあります)');
  translated = translated.replaceAll('TypeError: object.readline() returned non-string', 'ファイルの末尾に到達しました (入力の受け取り方や入力欄が正しくないことがあります)');
  translated = translated.replaceAll("SyntaxError: Missing parentheses in call to 'print'. Did you mean print(...)?", 'print() のように print の後に括弧が必要です');

  // 存在しない
  translated = translated.replaceAll(/NameError: name '(.*)' is not defined/g, '「$1」が見つかりません (小文字と大文字は区別します) (文字列はダブルクオーテーションで囲みます)');
  translated = translated.replaceAll(/ValueError: list.remove(x): x not in list/g, 'remove で消そうとしている要素が存在していません');
  translated = translated.replaceAll(/AttributeError: '(.*)' object has no attribute '(.*)'/g, '「$1」のオブジェクトに「.$2」は存在しません');

  // 添え字
  translated = translated.replaceAll(/TypeError: '(.*)' object is not subscriptable/g, '「$1」のオブジェクトに添え字は使えません');
  translated = translated.replaceAll('IndexError: string index out of range', '文字列の長さ以上の添え字の文字にアクセスしようとしました');
  translated = translated.replaceAll('IndexError: tuple index out of range', 'タプルの長さ以上の添え字の要素にアクセスしようとしました');
  translated = translated.replaceAll('IndexError: list index out of range', 'リストの長さ以上の添え字の要素にアクセスしようとしました');
  translated = translated.replaceAll('IndexError: list assignment index out of range', 'リストの長さ以上の添え字の要素に代入しようとしました');
  translated = translated.replaceAll(/KeyError: '(.*)'/g, 'キー「$1」は存在しません');
  translated = translated.replaceAll('TypeError: string indices must be integers', '文字列の添え字は整数にしてください');
  translated = translated.replaceAll(/TypeError: list indices must be integers or slices, not (.*)/g, 'リストの添え字は「$1」ではなく整数やスライスにしてください');
  translated = translated.replaceAll(/TypeError: 'str' object does not support item assignment/g, '文字列から添え字で取り出した文字は読み取り専用で代入はできません');
  translated = translated.replaceAll(/TypeError: '(.*)' object does not support item assignment/g, '「$1」の添え字で指定した要素に代入することはできません');

  // イコール
  translated = translated.replaceAll("SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?", '文法が間違っています');
  translated = translated.replaceAll("SyntaxError: cannot assign to expression here. Maybe you meant '==' instead of '='?", '代入のイコールの左辺に式は使えません');
  translated = translated.replaceAll("SyntaxError: cannot assign to function call here. Maybe you meant '==' instead of '='?", '代入のイコールの左辺に関数呼び出しは使えません');
  translated = translated.replaceAll("SyntaxError: cannot assign to subscript here. Maybe you meant '==' instead of '='?", '代入のイコールの左辺に添え字は使えません');
  translated = translated.replaceAll("SyntaxError: cannot assign to literal here. Maybe you meant '==' instead of '='?", '代入のイコールの左辺に値は使えません');
  translated = translated.replaceAll('SyntaxError: cannot assign to operator', '代入のイコールの左辺に演算子は使えません');

  // 開きと閉じ
  translated = translated.replaceAll('SyntaxError: EOL while scanning string literal', '文字列の終わりのクオーテーションが見つかりません');
  translated = translated.replaceAll(/SyntaxError: unterminated string literal \(detected at line \d*\)/g, '文字列の終わりのクオーテーションが見つかりません');
  translated = translated.replaceAll('SyntaxError: unexpected EOF while parsing', '括弧などを閉じないまま行が終わってしまいました');
  translated = translated.replaceAll(/SyntaxError: unmatched '(.*)'/g, '「$1」の開きと閉じが対応していません');
  translated = translated.replaceAll(/SyntaxError: '(.*)' was never closed/g, '「$1」に対応した閉じがありません');

  // 文法
  translated = translated.replaceAll('SyntaxError: invalid syntax. Perhaps you forgot a comma?', '文法が間違っています (コンマを忘れていませんか？)');
  translated = translated.replaceAll('SyntaxError: invalid syntax', '文法が間違っています');
  translated = translated.replaceAll(/SyntaxError: expected '(.*)'/g, '「$1」が必要です');
  translated = translated.replaceAll(/SyntaxError: invalid character '(.*)' \((.*)\)/g, '「$1」という文字は使えません (誤って全角文字を使っていることがあります)');
  translated = translated.replaceAll('SyntaxError: invalid decimal literal', '文字や数値が混ざっています (変数名の先頭はアルファベットでなければなりません) (掛け算の記号 * は省略できません)');
  translated = translated.replaceAll("SyntaxError: 'return' outside function", '関数の中身以外で return を使うことはできません');

  // 演算
  translated = translated.replaceAll('ZeroDivisionError: division by zero', 'ゼロで割ろうとしました');
  translated = translated.replaceAll('ZeroDivisionError: integer division or modulo by zero', 'ゼロで割ろうとしました');
  translated = translated.replaceAll(/TypeError: unsupported operand type\(s\) for (.*): '(.*)' and '(.*)'/g, '「$2」と「$3」の間で「$1」の計算はできません');
  translated = translated.replaceAll(/TypeError: '(.*)' not supported between instances of '(.*)' and '(.*)'/g, '「$2」と「$3」の間で「$1」の計算はできません');
  translated = translated.replaceAll(/TypeError: can only concatenate str \(not "(.*)"\) to str/g, '「$1」と文字列を + で結合することはできません (文字列同士のみ結合できます)');

  // 型
  translated = translated.replaceAll(/TypeError: '(.*)' object cannot be interpreted as an integer/g, '「$1」を整数値とみなすことはできません');
  translated = translated.replaceAll(/TypeError: '(.*)' object is not iterable/g, '「$1」は繰り返し不可能です (リストのように使うことはできません)');
  translated = translated.replaceAll(/TypeError: argument of type '(.*)' is not iterable/g, '「$1」は繰り返し不可能です (in の右辺に使うことはできません)');

  // 組み込み関数呼び出し
  translated = translated.replaceAll(/TypeError: object of type '(.*)' has no len\(\)/g, 'len() の括弧内は「$1」にはできません');
  translated = translated.replaceAll(/TypeError: ord\(\) expected a character, but string of length (.*) found/g, 'ord() の括弧内の文字列は長さ 1 でないといけませんが，長さ $1 の文字列が渡されました');
  translated = translated.replaceAll(/TypeError: ord\(\) expected string of length 1, but (.*) found/g, 'ord() の括弧内は 1 文字の文字列でないといけませんが，「$1」が渡されました');

  // 関数呼び出し
  translated = translated.replaceAll(/TypeError: '(.*)' object is not callable/g, '「$1」のオブジェクトは関数ではないので () を付けても呼び出せません');
  translated = translated.replaceAll(/TypeError: (.*) must have at least two arguments./g, '$1 には少なくとも 2 つの引数が必要です');
  translated = translated.replaceAll(/TypeError: (.*) expected at least (.*) argument, got (.*)/g, '$1() には少なくとも $2 個の引数が必要ですが，$3 個渡されました');
  translated = translated.replaceAll(/TypeError: (.*) argument must be a string, a bytes-like object or a number, not '(.*)'/g, '$1 の引数が「$2」であってはいけません');
  translated = translated.replaceAll(/TypeError: '(.*)' is an invalid keyword argument for (.*)/g, '$2 に「$1」という引数はありません');
  translated = translated.replaceAll(/ValueError: (.*) arg is an empty sequence/g, '$1 の引数が空の列になってしまいました');
  translated = translated.replaceAll(/TypeError: (.*)\(\) takes no keyword arguments/g, '$1() の括弧内にイコールは使えません');

  // 単語
  translated = translated.replaceAll('「int」', '「整数 (int)」');
  translated = translated.replaceAll('「float」', '「小数 (float)」');
  translated = translated.replaceAll('「str」', '「文字列 (str)」');
  translated = translated.replaceAll('「list」', '「リスト (list)」');
  translated = translated.replaceAll('「tuple」', '「タプル (tuple)」');
  translated = translated.replaceAll('「NoneType」', '「値ではないもの (NoneType)」');
  translated = translated.replaceAll('builtin_function_or_method', '組み込み関数');

  // その他
  translated = translated.replaceAll('MemoryError', 'メモリの使いすぎです (巨大なリストを作成したり無限ループが発生したりしたときに表示されることがあります)');
  translated = translated.replaceAll(/ModuleNotFoundError: No module named '(.*)'/g, '「$1」というモジュールが見つかりません (micropip でインストールできるかもしれません)');

  lastTranslationSuccess = (basicTranslated != translated) ? 'success' : 'failure';

  return translated;
}
