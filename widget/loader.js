// 천문 예보 위젯 — 최신 스크립트를 받아 실행한다. 위젯의 Parameter에 종류를 적는다(예: 달).
// 매번 바뀌었는지 묻고(ETag), 바뀌었을 때만 새로 받는다. 받지 못하면 저장해 둔 것을 쓴다.
const SRC = 'https://chan7881.github.io/astronomy/widget/astro-widget.js';
const fm = FileManager.local(), dir = fm.libraryDirectory();
const file = fm.joinPath(dir, 'astro-widget.cache.js'), tagFile = fm.joinPath(dir, 'astro-widget.etag');
let code = fm.fileExists(file) ? fm.readString(file) : null;
const tag = code && fm.fileExists(tagFile) ? fm.readString(tagFile) : null;
try {
  const r = new Request(SRC);
  r.timeoutInterval = 5;   // 위젯은 몇 초 안에 끝나야 한다 — 늦으면 저장본으로
  if (tag) r.headers = { ...(r.headers || {}), 'If-None-Match': tag };
  const s = await r.loadString(), res = r.response || {};
  if (res.statusCode === 200 && s.startsWith('// ASTRO_WIDGET')) {
    fm.writeString(file, s); code = s;
    const h = res.headers || {}, k = Object.keys(h).find(x => x.toLowerCase() === 'etag');
    if (k) fm.writeString(tagFile, String(h[k]));
    else if (fm.fileExists(tagFile)) fm.remove(tagFile);   // 저장본과 맞지 않는 표는 지운다
  }
} catch (e) { /* 받지 못하면 저장해 둔 것을 쓴다 */ }
if (!code) throw new Error('위젯 스크립트를 받지 못했습니다. 인터넷 연결을 확인하세요.');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
await new AsyncFunction(code)();
