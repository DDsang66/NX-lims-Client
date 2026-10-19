/**
 * 单元格「末尾等号」内联算术。
 *
 * 需求：质量/克重格子里输入 `1.9/1.1=`，敲下最后一个 `=` 的瞬间就把整格替换成结果。
 * 结果最多 4 位小数、四舍五入、去掉末尾 0（1.9/1.1 → 1.7273，2.5 → 2.5）。
 *
 * 为什么不用 eval / new Function：输入是用户手敲的，eval 等于把它当代码执行；
 * 这里只需要四则运算与括号，递归下降几十行就够，而且非法输入可以精确地「原样返回」。
 *
 * 约定：
 *  - 只有去除尾部空白后**以 `=` 结尾**才触发；其余值原样返回（包括 null / number）。
 *  - 表达式非法、空表达式、除零、结果非有限数 → **原样返回**，绝不吞掉用户输入。
 *  - 支持 `+ - * /`、一元正负号、圆括号与任意空白。
 */

const MAX_EXPRESSION_LENGTH = 200;
const RESULT_DECIMALS = 4;

/**
 * 把一格输入按「末尾等号」规则求值。
 * @param {string|number|null} raw el-input 的 update:model-value 原值
 * @returns {string|number|null} 求值结果（数字字符串）或原值
 */
export function applyInlineCalc(raw) {
  if (typeof raw !== 'string') return raw;

  const text = raw.trimEnd();
  if (!text.endsWith('=')) return raw;

  const value = evaluateExpression(text.slice(0, -1));
  if (value === null) return raw;

  return formatResult(value);
}

/**
 * 递归下降求值：
 *   expr    := term (('+'|'-') term)*
 *   term    := unary (('*'|'/') unary)*
 *   unary   := ('+'|'-') unary | primary
 *   primary := number | '(' expr ')'
 * @param {string} source
 * @returns {number|null} 非法输入 / 除零 / 非有限数返回 null
 */
export function evaluateExpression(source) {
  if (typeof source !== 'string') return null;

  const text = source.trim();
  if (!text || text.length > MAX_EXPRESSION_LENGTH) return null;

  let pos = 0;

  function skipSpaces() {
    while (pos < text.length && /\s/.test(text[pos])) pos++;
  }

  function parseExpression() {
    let left = parseTerm();
    if (left === null) return null;

    for (;;) {
      skipSpaces();
      const op = text[pos];
      if (op !== '+' && op !== '-') return left;
      pos++;

      const right = parseTerm();
      if (right === null) return null;
      left = op === '+' ? left + right : left - right;
    }
  }

  function parseTerm() {
    let left = parseUnary();
    if (left === null) return null;

    for (;;) {
      skipSpaces();
      const op = text[pos];
      if (op !== '*' && op !== '/') return left;
      pos++;

      const right = parseUnary();
      if (right === null) return null;
      // 除零：保留原文，交回用户改（Infinity 也会被最后的 isFinite 拦下，这里提前返回更直白）
      if (op === '/' && right === 0) return null;

      left = op === '*' ? left * right : left / right;
    }
  }

  function parseUnary() {
    skipSpaces();
    const op = text[pos];
    if (op === '+' || op === '-') {
      pos++;
      const value = parseUnary();
      if (value === null) return null;
      return op === '-' ? -value : value;
    }
    return parsePrimary();
  }

  function parsePrimary() {
    skipSpaces();
    if (text[pos] === '(') {
      pos++;
      const value = parseExpression();
      if (value === null) return null;

      skipSpaces();
      if (text[pos] !== ')') return null;
      pos++;
      return value;
    }
    return parseNumber();
  }

  function parseNumber() {
    skipSpaces();
    const match = /^(?:\d+(?:\.\d*)?|\.\d+)/.exec(text.slice(pos));
    if (!match) return null;

    pos += match[0].length;
    const value = Number(match[0]);
    return Number.isFinite(value) ? value : null;
  }

  const value = parseExpression();
  skipSpaces();
  if (value === null || pos !== text.length) return null;

  return Number.isFinite(value) ? value : null;
}

/**
 * 4 位小数四舍五入 → 去掉末尾 0；-0 归一成 "0"。
 * 用 Number(...toFixed) 而不是正则去尾零：正则会把整数 1000 的尾零一起吃掉。
 */
function formatResult(value) {
  const rounded = Number(value.toFixed(RESULT_DECIMALS));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}
