// 위젯 묶음 만들기: ES 모듈들을 Scriptable이 읽는 파일 하나(widget/astro-widget.js)로 합친다.
//   node widget/build.mjs
// Scriptable에는 import가 없어서, 모듈마다 함수로 감싸고 내보낸 이름을 객체로 돌려주게 바꾼다.
import { readFileSync, writeFileSync } from 'node:fs';
import { posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, ROOT), 'utf8').replace(/\r\n/g, '\n');
export const ENTRY = 'widget/app.js', OUT = 'widget/astro-widget.js', VENDOR = 'vendor/astronomy.browser.min.js';

/** `A = 1, B = f(x, y)` → ['A', 'B'] — 괄호·따옴표 밖의 쉼표만 선언을 가른다 */
export function declNames(rest) {
  const names = [];
  let depth = 0, quote = null, expectName = true;
  for (let i = 0; i < rest.length; i++) {
    const ch = rest[i];
    if (quote) { if (ch === '\\') i++; else if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    else if (ch === ',' && depth === 0) expectName = true;
    else if (expectName && /[A-Za-z_$]/.test(ch)) {
      const m = rest.slice(i).match(/^[\w$]+/)[0];
      names.push(m); i += m.length - 1; expectName = false;
    }
  }
  return names;
}

/** 반환 {code, modules: {id: [내보낸 이름]}} */
export function bundle() {
  const modules = {}, parts = [];
  const visit = id => {
    if (id in modules) return;
    const names = modules[id] = [];
    let src = read(id);
    src = src.replace(/^import\s+(?:\*\s+as\s+(\w+)|\{([^}]+)\})\s+from\s+'([^']+)';?[ \t]*$/gm, (_, ns, list, spec) => {
      if (list && /\sas\s/.test(list)) throw new Error(`${id}: 「as」로 이름을 바꾼 import는 묶지 못한다`);
      const dep = posix.normalize(posix.join(posix.dirname(id), spec));
      visit(dep);
      const missing = list ? list.split(',').map(x => x.trim()).filter(x => x && !modules[dep].includes(x)) : [];
      if (missing.length) throw new Error(`${id}: ${dep}에 없는 이름 ${missing.join(', ')} — export 줄을 한 줄에 하나씩 쓸 것`);
      return ns ? `const ${ns} = __m[${JSON.stringify(dep)}];` : `const {${list}} = __m[${JSON.stringify(dep)}];`;
    });
    src = src.replace(/^export\s+(async\s+function|function|class)\s+([\w$]+)/gm, (_, kw, name) => { names.push(name); return `${kw} ${name}`; });
    src = src.replace(/^export\s+(const|let)\s+(.*)$/gm, (_, kw, rest) => { names.push(...declNames(rest)); return `${kw} ${rest}`; });
    if (/^\s*(import|export)\s/m.test(src)) throw new Error(`${id}: 바꾸지 못한 import/export가 남았다`);
    parts.push(`// ── ${id}\n__m[${JSON.stringify(id)}] = (() => {\n${src}\nreturn { ${names.join(', ')} };\n})();`);
  };
  visit(ENTRY);
  const code = `// ASTRO_WIDGET — 천문 관측 예보 위젯 (https://chan7881.github.io/astronomy/)
// 이 파일은 widget/build.mjs가 만든다. 직접 고치지 않는다.
if (typeof URLSearchParams === 'undefined') {
  globalThis.URLSearchParams = class {
    constructor(o) { this.o = o; }
    toString() { return Object.keys(this.o).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(this.o[k])).join('&'); }
  };
}
const __a = { exports: {} };
(function (module, exports) {
${read(VENDOR)}
})(__a, __a.exports);
const Astronomy = __a.exports;
const __m = {};
${parts.join('\n')}
await __m[${JSON.stringify(ENTRY)}].run();
`;
  return { code, modules };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { code, modules } = bundle();
  writeFileSync(new URL(OUT, ROOT), code);
  console.log(`${OUT}: ${code.length}자, 모듈 ${Object.keys(modules).length}개`);
}
