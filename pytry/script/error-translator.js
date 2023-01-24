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
  translated = translated.replaceAll(/IndentationError: expected an indented block after '(.*)' statement on line (.*)/g, '$2 行目で $1 文を使っているため，ここにはインデントされたコードが必要です');
  translated = translated.replaceAll('IndentationError: expected an indented block', 'インデントを忘れています');
  translated = translated.replaceAll('IndentationError: unexpected indent', 'インデントがおかしな位置にあります');
  translated = translated.replaceAll('IndentationError: unindent does not match any outer indentation level', 'インデントが揃っていません');
  translated = translated.replaceAll('SyntaxError: invalid non-printable character U+3000', '全角スペースが紛れ込んでいるため，半角スペース 2 個に直しましょう');
  translated = translated.replaceAll('TabError: inconsistent use of tabs and spaces in indentation', 'インデントでタブと半角スペースが混ざっています');

  // 入出力
  translated = translated.replaceAll(/ValueError: invalid literal for int\(\) with base 10: '([\d\s]*)'/g, `「$1」を整数に変換できません
• int(input()) の代わりに map(int, input().split()) を使ってはどうですか？
• 入力欄について，整数が 1 行に 1 個ずつになるように改行してはどうですか？`);
  translated = translated.replaceAll(/ValueError: invalid literal for int\(\) with base 10: '(.*)'/g, `「$1」を整数に変換できません
• int(input()) の代わりに input() を使ってはどうですか？`);
  translated = translated.replaceAll(/ValueError: not enough values to unpack \(expected (.*), got (.*)\)/g, `$2 個しかないデータを $1 個に分けようとしました
• map(int, input().split()) の代わりに int(input()) を使ってはどうですか？
• 入力欄について，整数を空白で区切って 1 行にまとめて書いてはどうですか？`);
  translated = translated.replaceAll(/ValueError: too many values to unpack \(expected (.*)\)/g, `$1 個より多いデータを $1 個に分けようとしました
• 入力を受け取るコードと入力欄の書き方が一致していないかもしれません`);
  translated = translated.replaceAll('EOFError: EOF when reading a line', `ファイルの末尾に到達しました
• 入力欄の内容が足りていないかもしれません
• 入力を受け取るコードが多すぎるかもしれません`);
  translated = translated.replaceAll('TypeError: object.readline() returned non-string', `ファイルの末尾に到達しました
• 入力欄の内容が足りていないかもしれません
• 入力を受け取るコードが多すぎるかもしれません`);
  translated = translated.replaceAll("SyntaxError: Missing parentheses in call to 'print'. Did you mean print(...)?", 'print() のように print の後に括弧が必要です');

  // 存在しない
  translated = translated.replaceAll(/NameError: name '(.*)' is not defined/g, `「$1」が見つかりません
• 変数名などの小文字と大文字は区別します
• 文字列はダブルクオーテーションで囲みます`);
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
  translated = translated.replaceAll('TypeError: slice indices must be integers or None or have an __index__ method', 'スライスの添え字は整数にしてください');
  translated = translated.replaceAll(/TypeError: 'str' object does not support item assignment/g, '文字列から添え字で取り出した文字は読み取り専用で代入はできません');
  translated = translated.replaceAll(/TypeError: '(.*)' object does not support item assignment/g, '「$1」の添え字で指定した要素に代入することはできません');

  // イコール
  translated = translated.replaceAll("SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?", '文法が間違っています');
  translated = translated.replaceAll("SyntaxError: cannot assign to expression here. Maybe you meant '==' instead of '='?", '代入のイコールの左辺に式は使えません');
  translated = translated.replaceAll('SyntaxError: cannot assign to function call', '代入のイコールの左辺に関数呼び出しは使えません');
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
  translated = translated.replaceAll(/SyntaxError: closing parenthesis '(.*)' does not match opening parenthesis '(.*)'/g, '開き括弧「$2」に対応する閉じ括弧が「$1」になっています');
  translated = translated.replaceAll(/SyntaxError: unterminated triple-quoted string literal \(detected at line (.*)\)/g, '三連引用符 (ダブルクオーテーションを 3 つ使って囲む記法) が閉じていません');

  // 文法
  translated = translated.replaceAll('SyntaxError: invalid syntax. Perhaps you forgot a comma?', `文法が間違っています
• コンマを忘れていませんか？`);
  translated = translated.replaceAll('SyntaxError: invalid syntax', '文法が間違っています');
  translated = translated.replaceAll(/SyntaxError: expected '(.*)'/g, '「$1」が必要です');
  translated = translated.replaceAll(/SyntaxError: invalid character '(.*)' \((.*)\)/g, `「$1」という文字は使えません
• 全角文字を使っている場合は半角文字に直してください`);
  translated = translated.replaceAll('SyntaxError: invalid decimal literal', `文字や数値が混ざっています
• 変数名の先頭はアルファベットでなければなりません
• 掛け算の記号 * は省略できません`);
  translated = translated.replaceAll('SyntaxError: leading zeros in decimal integer literals are not permitted; use an 0o prefix for octal integers', '数値の先頭に 0 を付けることはできません');
  translated = translated.replaceAll(/SyntaxError: '(.*)' outside loop/g, 'ループの中以外で $1 は使えません');
  translated = translated.replaceAll(/SyntaxError: '(.*)' outside function/g, '関数の中以外で $1 は使えません');
  translated = translated.replaceAll("SyntaxError: ':' expected after dictionary key", '辞書ではキーと値の間に「:」が必要です');

  // 演算
  translated = translated.replaceAll('ZeroDivisionError: division by zero', 'ゼロで割ろうとしました');
  translated = translated.replaceAll('ZeroDivisionError: integer division or modulo by zero', 'ゼロで割ろうとしました');
  translated = translated.replaceAll(/TypeError: unsupported operand type\(s\) for (.*): '(.*)' and '(.*)'/g, '「$2」と「$3」の間で「$1」の計算はできません');
  translated = translated.replaceAll(/TypeError: '(.*)' not supported between instances of '(.*)' and '(.*)'/g, '「$2」と「$3」の間で「$1」の計算はできません');
  translated = translated.replaceAll(/TypeError: can only concatenate str \(not "(.*)"\) to str/g, `「$1」と文字列を + で結合することはできません
• 文字列同士のみ結合できます
• str() を使って文字列でないものを文字列に変換できます`);
  translated = translated.replaceAll(/TypeError: can only concatenate list (not "(.*)") to list/g, '「$1」とリストを + で結合することはできません');
  translated = translated.replaceAll(/TypeError: bad operand type for unary ([+-]): '(.*)'/g, '「$2」に符号 $1 を付けることはできません');

  // 型
  translated = translated.replaceAll(/TypeError: '(.*)' object cannot be interpreted as an integer/g, '「$1」を整数値とみなすことはできません');
  translated = translated.replaceAll('TypeError: not all arguments converted during string formatting', `文字列フォーマットで使われていない引数が存在します
• 割り算の余りを求める % の左辺が文字列になっていませんか？`);
  translated = translated.replaceAll(/TypeError: 'int' object is not iterable/g, `整数値は繰り返し不可能です
• range() を使ってはどうですか？`);
  translated = translated.replaceAll(/TypeError: '(.*)' object is not iterable/g, '「$1」は繰り返し不可能です (リストのように使うことはできません)');
  translated = translated.replaceAll(/TypeError: argument of type '(.*)' is not iterable/g, '「$1」は繰り返し不可能です (in の右辺に使うことはできません)');

  // 組み込み関数呼び出し
  translated = translated.replaceAll(/TypeError: object of type '(.*)' has no len\(\)/g, 'len() の括弧内は「$1」にはできません');
  translated = translated.replaceAll(/TypeError: ord\(\) expected a character, but string of length (.*) found/g, 'ord() の括弧内の文字列は長さ 1 でないといけませんが，長さ $1 の文字列が渡されました');
  translated = translated.replaceAll(/TypeError: ord\(\) expected string of length 1, but (.*) found/g, 'ord() の括弧内は 1 文字の文字列でないといけませんが，「$1」が渡されました');
  translated = translated.replaceAll('TypeError: type() takes 1 or 3 arguments', 'type() の括弧内の引数は 1 個または 3 個です');

  // 関数呼び出し
  translated = translated.replaceAll(/TypeError: '(.*)' object is not callable/g, '「$1」のオブジェクトは関数ではないので () を付けても呼び出せません');
  translated = translated.replaceAll(/TypeError: (.*) must have at least two arguments./g, '$1 には少なくとも 2 つの引数が必要です');
  translated = translated.replaceAll(/TypeError: (.*) expected at least (.*) argument, got (.*)/g, '$1() には少なくとも $2 個の引数が必要ですが，$3 個渡されました');
  translated = translated.replaceAll(/TypeError: (.*) expected (.*) arguments, got (.*)/g, '$1() の引数は $2 個ですが，$3 個与えられました');
  translated = translated.replaceAll(/TypeError: (.*) expected at most (.*) argument, got (.*)/g, '$1() には高々 $2 個の引数が必要ですが，$3 個渡されました');
  translated = translated.replaceAll(/TypeError: (.*) argument must be (.*), not '(.*)'/g, '$1 の引数が「$3」であってはいけません');
  translated = translated.replaceAll(/TypeError: '(.*)' is an invalid keyword argument for (.*)/g, '$2 に「$1」という引数はありません');
  translated = translated.replaceAll(/ValueError: (.*) arg is an empty sequence/g, '$1 の引数が空の列になってしまいました');
  translated = translated.replaceAll(/TypeError: (.*)\(\) takes no keyword arguments/g, '$1() の括弧内にイコールは使えません');
  translated = translated.replaceAll(/TypeError: (.*)\(\) missing 1 required positional argument: '(.*)'/g, '$1() の引数「$2」が指定されていません');

  // 非同期処理
  translated = translated.replaceAll("SyntaxError: 'await' outside function", '関数の中以外で await は使えません');

  // モジュール
  translated = translated.replaceAll(/ModuleNotFoundError: No module named '(.*)'/g, '「$1」というモジュールが見つかりません');
  translated = translated.replaceAll(/AttributeError: module '(.*)' has no attribute '(.*)'/g, 'モジュール「$1」に「$2」は存在しません');

  // 単語
  translated = translated.replaceAll('「** or pow()」', ' ** や pow() ');
  translated = translated.replaceAll('「int」', '「整数 (int)」');
  translated = translated.replaceAll('「float」', '「小数 (float)」');
  translated = translated.replaceAll('「str」', '「文字列 (str)」');
  translated = translated.replaceAll('「list」', '「リスト (list)」');
  translated = translated.replaceAll('「tuple」', '「タプル (tuple)」');
  translated = translated.replaceAll('「NoneType」', '「値ではないもの (NoneType)」');
  translated = translated.replaceAll('builtin_function_or_method', '組み込み関数');

  // その他
  translated = translated.replaceAll('MemoryError', `メモリの使いすぎです
• 巨大なリストを作成していませんか？
• 無限ループが発生していませんか？`);
  translated = translated.replaceAll("OverflowError: cannot fit 'int' into an index-sized integer", 'リストが長すぎます');

  lastTranslationSuccess = (basicTranslated != translated) ? 'success' : 'failure';

  return translated;
}
