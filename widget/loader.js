// 천문 예보 위젯 — 최신 스크립트를 받아 실행한다. 위젯의 Parameter에 종류를 적는다(예: 달).
const SRC = 'https://chan7881.github.io/astronomy/widget/astro-widget.js';
const fm = FileManager.local(), file = fm.joinPath(fm.libraryDirectory(), 'astro-widget.cache.js');
let code = fm.fileExists(file) ? fm.readString(file) : null;
if (!code || Date.now() - fm.modificationDate(file).getTime() > 6 * 3600e3) {
  try {
    const r = new Request(SRC), s = await r.loadString();
    if (r.response.statusCode === 200 && s.startsWith('// ASTRO_WIDGET')) { fm.writeString(file, s); code = s; }
  } catch (e) { /* 받지 못하면 저장해 둔 것을 쓴다 */ }
}
if (!code) throw new Error('위젯 스크립트를 받지 못했습니다. 인터넷 연결을 확인하세요.');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
await new AsyncFunction(code)();
