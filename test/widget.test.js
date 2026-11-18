import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { makeSky } from '../js/sky.js';
import { normalize, LEVELS } from '../js/api.js';
import { baseNoon, nightView } from '../js/view.js';
import { widgetModel, highestBody, bandHours } from '../widget/data.js';
import { layout, lockText, lockCircle, moonShape, dashes, textWidth, fitText, blockValue, KINDS, SIZES, ALT_RULE } from '../widget/layout.js';
import { parseParam, roundHere, hereName } from '../widget/param.js';
import { toSvg } from '../widget/svg.js';
import { T } from '../widget/theme.js';
import { bundle, declNames, OUT } from '../widget/build.mjs';

const mod = { exports: {} };
new Function('module', 'exports', readFileSync(new URL('../vendor/astronomy.browser.min.js', import.meta.url), 'utf8'))(mod, mod.exports);
const sky = makeSky(mod.exports);

const POHANG = { name: '포항', lat: 36.019, lon: 129.343, elev: 20 };
const KST = 9 * 3600e3, kst = s => Date.parse(s + '+09:00');

/** Open-Meteo 응답 흉내. start: 현지 시각 'YYYY-MM-DDTHH:00', 값은 시각과 무관하게 일정 */
function fakeForecast(start, hours, { cloud = 10, dew = 4 } = {}) {
  const t0 = Date.parse(start + ':00Z'), time = Array.from({ length: hours }, (_, i) => new Date(t0 + i * 3600e3).toISOString().slice(0, 16));
  const fill = v => time.map(() => v);
  const hourly = {
    time, temperature_2m: fill(10), dew_point_2m: fill(dew), relative_humidity_2m: fill(60), cloud_cover: fill(cloud),
    cloud_cover_low: fill(cloud), cloud_cover_mid: fill(0), cloud_cover_high: fill(0), wind_speed_10m: fill(2),
    wind_direction_10m: fill(270), wind_gusts_10m: fill(4), precipitation_probability: fill(0), visibility: fill(20000),
  };
  for (const p of LEVELS) {
    const z = 44330 * (1 - (p / 1013.25) ** 0.1903);
    hourly[`temperature_${p}hPa`] = fill(Math.max(-56.5, 15 - 6.5 * z / 1000));
    hourly[`geopotential_height_${p}hPa`] = fill(z);
    hourly[`wind_speed_${p}hPa`] = fill(5 + z / 1000);
    hourly[`wind_direction_${p}hPa`] = fill(270);
  }
  const fc = { utc_offset_seconds: 32400, elevation: 20, timezone: 'Asia/Seoul', hourly };
  const air = { utc_offset_seconds: 32400, hourly: { time, aerosol_optical_depth: fill(0.1), pm2_5: fill(10), dust: fill(1) } };
  return { fc, air };
}
const fixture = opt => { const { fc, air } = fakeForecast('2026-11-15T00:00', 24 * 7, opt); return normalize(fc, air); };
const NOW = kst('2026-11-16T21:10');
const model = (opt, now = NOW) => widgetModel(sky, POHANG, fixture(opt), now);
const texts = spec => spec.ops.filter(o => o.op === 'text').map(o => o.text);

test('자료: 밤 5개, 첫 밤은 11월 16일 월요일이고 아침 8시 전에는 지난밤', () => {
  const m = model();
  assert.equal(m.nights.length, 5);
  assert.deepEqual([m.nights[0].month, m.nights[0].day, m.nights[0].wd], [11, 16, '월']);
  assert.deepEqual(m.nights.map(v => v.day), [16, 17, 18, 19, 20]);
  assert.equal(model({}, kst('2026-11-17T07:30')).nights[0].day, 16);
  assert.equal(model({}, kst('2026-11-17T08:30')).nights[0].day, 17);
});

test('자료: 맑은 밤이 흐린 밤보다 점수가 높고 등급이 갈린다', () => {
  const clear = model({ cloud: 5 }).nights[0].summary, cloudy = model({ cloud: 95 }).nights[0].summary;
  assert.ok(clear.score > 60 && cloudy.score < 10, `${clear.score} / ${cloudy.score}`);
  assert.equal(clear.grade, 'g'); assert.equal(cloudy.grade, 'b');
  assert.equal(Math.round(clear.cloudAvg), 5);
});

test('자료: 본판과 같은 계산(nightView)을 쓴다', () => {
  const data = fixture(), m = widgetModel(sky, POHANG, data, NOW);
  const v = nightView(sky, POHANG, data, baseNoon(NOW, KST));
  assert.equal(m.nights[0].summary.score, v.summary.score);
  assert.equal(m.nights[0].night.sunset, v.night.sunset);
});

test('지금 천체: 밤에는 지금, 낮에는 시민박명이 끝나는 때를 본다', () => {
  const night = model(), day = model({}, kst('2026-11-16T13:00'));
  assert.equal(night.evalT, NOW); assert.equal(night.isNow, true);
  assert.equal(day.evalT, day.nights[0].night.civilEnd); assert.equal(day.isNow, false);
  assert.ok(day.evalT > kst('2026-11-16T17:14') && day.evalT < kst('2026-11-16T18:00'));
});

test('지금 천체: 2026-11-16 21:10 포항에서는 토성이 가장 높다(남쪽 하늘)', () => {
  const b = model().nowBody;
  assert.equal(b.id, 'Saturn');
  assert.ok(b.alt > 40 && b.alt < 62, String(b.alt));
  assert.match(b.dir, /남/);
  // 맨눈 행성이 없을 때만 천왕성·해왕성으로 넘어간다
  const fake = { altAz: id => ({ alt: { Uranus: 70, Mars: 5 }[id] ?? -10, az: 180 }) };
  assert.equal(highestBody(fake, POHANG, 0).id, 'Mars');
  const two = { altAz: id => ({ alt: { Mars: 5, Jupiter: 40, Venus: 12 }[id] ?? -10, az: 180 }) };
  assert.equal(highestBody(two, POHANG, 0).id, 'Jupiter');
  const fake2 = { altAz: id => ({ alt: id === 'Uranus' ? 70 : -10, az: 180 }) };
  assert.equal(highestBody(fake2, POHANG, 0).id, 'Uranus');
  assert.equal(highestBody({ altAz: () => ({ alt: -1, az: 0 }) }, POHANG, 0), null);
});

test('띠 자료: 해진 뒤 첫 정시부터 12칸', () => {
  const v = model().nights[0], hs = bandHours(v);
  assert.equal(hs.length, 12);
  assert.equal(new Date(hs[0].t + KST).toISOString().slice(11, 16), '18:00');
  assert.equal(new Date(hs[11].t + KST).toISOString().slice(11, 16), '05:00');
});

test('달 모양: 밝은 넓이가 위상과 맞고, 차오르는 달은 오른쪽이 밝다', () => {
  const area = pts => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  const cx = pts => pts.reduce((s, p) => s + p[0], 0) / pts.length;
  for (const d of [30, 90, 135, 180, 225, 270, 330]) {
    const pts = moonShape(d, 100, 50, 20, 180), frac = area(pts) / (Math.PI * 400);
    assert.ok(Math.abs(frac - (1 - Math.cos(d * Math.PI / 180)) / 2) < 0.005, `${d}°: ${frac}`);
  }
  assert.ok(cx(moonShape(90, 100, 50, 20)) > 105, '상현은 오른쪽');
  assert.ok(cx(moonShape(270, 100, 50, 20)) < 95, '하현은 왼쪽');
  assert.ok(Math.abs(cx(moonShape(180, 100, 50, 20)) - 100) < 0.01, '보름은 가운데');
});

test('점선: 그린 길이와 조각 수', () => {
  const segs = dashes([[0, 0], [60, 0], [100, 0]], [7, 4]);
  const len = segs.reduce((s, p) => s + p.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0), 0);
  assert.equal(segs.length, 10);
  assert.ok(Math.abs(len - 64) < 1e-9, String(len));
  assert.deepEqual(segs[1][0], [11, 0]);
});

test('설정값: 종류·좌표·이름을 아무 순서로, 크기에 맞지 않으면 기본 위젯', () => {
  assert.deepEqual(parseParam(null, 'small'), { kind: '점수', place: { name: '내 위치', lat: 36.019, lon: 129.343, elev: 0, here: true, custom: false }, glass: false });
  assert.equal(parseParam('달', 'small').kind, '달');
  assert.equal(parseParam('달', 'medium').kind, '판정');
  assert.equal(parseParam('5일 ', 'medium').kind, '5일');
  assert.equal(parseParam('기상', 'medium').kind, '시간별');
  assert.equal(parseParam('천체', 'extraLarge').kind, '천체');
  const p = parseParam('보현산 | 36.17, 128.98 | 천체', 'large');
  assert.equal(p.kind, '천체');
  assert.deepEqual(p.place, { name: '보현산', lat: 36.17, lon: 128.98, elev: 0 });
  assert.equal(parseParam('36.17N 128.98E', 'small').place.name, '관측지');
  assert.equal(parseParam('달', 'accessoryCircular').kind, '달');
  assert.equal(parseParam('', 'accessoryCircular').kind, null);
});

test('배치: 13종 모두 크기에 맞고, 좌표가 유한하고, 글자가 판 밖으로 나가지 않는다', () => {
  assert.equal(Object.keys(KINDS).length, 13);
  for (const opt of [{}, { cloud: 95, dew: 9.5 }, { glass: true }]) {
    const m = model(opt);
    for (const kind of Object.keys(KINDS)) {
      const spec = layout(kind, m, opt), [w, h] = SIZES[KINDS[kind]];
      assert.deepEqual([spec.w, spec.h], [w, h], kind);
      assert.ok(spec.ops.length > 5, kind);
      for (const o of spec.ops) {
        const nums = o.op === 'poly' ? o.pts.flat() : Object.values(o).filter(v => typeof v === 'number');
        assert.ok(nums.every(Number.isFinite), `${kind}: ${JSON.stringify(o).slice(0, 120)}`);
        if (o.op !== 'text') continue;
        const tw = textWidth(o.text, o.size), left = o.align === 'l' ? o.x : o.align === 'c' ? o.x - tw / 2 : o.x - tw;
        assert.ok(left >= 2 && left + tw <= w - 2, `${kind}: 「${o.text}」 ${left.toFixed(1)}~${(left + tw).toFixed(1)} / ${w}`);
        assert.ok(o.y >= 0 && o.y + o.size * 1.2 <= h + 1, `${kind}: 「${o.text}」 y=${o.y}`);
      }
      assert.match(toSvg(spec), /^<svg[^]*<\/svg>$/);
    }
  }
});

test('배치: 자료가 없어도(예보 실패) 13종이 그려진다', () => {
  const m = widgetModel(sky, POHANG, null, NOW);
  assert.equal(m.nights[0].summary, null);
  for (const kind of Object.keys(KINDS)) assert.ok(layout(kind, m).ops.length > 1, kind);   // 바탕 + 내용
  assert.ok(texts(layout('시간별', m)).includes('예보 자료 없음'));
  assert.equal(lockText(m).inline, '관측 –');
});

test('고도 위젯: 곡선 아래에 일몰·일출 시각과 「밝은 면% 위상」, 달 모양은 글귀 왼쪽', () => {
  const m = model(), v = m.nights[0], spec = layout('고도', m), t = texts(spec);
  const at = s => t.indexOf(s);
  const sunset = t[at('일몰') + 1], sunrise = t[at('일출') + 1];
  // 포항 11월 16일: 일몰 17시 10분대, 다음 날 일출 7시 전후(한국천문연구원 역서와 몇 분 안)
  assert.match(sunset, /^17:1\d$/); assert.match(sunrise, /^0(6:5\d|7:0\d)$/);
  const label = `${Math.round(v.moon.frac * 100)}% ${v.moon.name}`;
  assert.ok(t.includes(label), t.join('|'));
  assert.match(label, /^\d+% 초승달$/);                       // 11월 16일은 차오르는 초승달
  const lab = spec.ops.find(o => o.op === 'text' && o.text === label);
  const disc = spec.ops.filter(o => o.op === 'circle' && o.cy > ALT_RULE).at(-1);
  assert.ok(disc && disc.cx + disc.r < lab.x - textWidth(label, 12), `${disc?.cx} vs ${lab.x}`);
  assert.ok(spec.ops.filter(o => o.op === 'text' && /°$|^\d\d$/.test(o.text)).every(o => o.y + o.size * 1.2 <= ALT_RULE));   // 곡선 눈금은 줄 위
});

test('배치: 점수·등급·달 글귀가 자료와 같다', () => {
  const m = model({ cloud: 5 }), s = m.nights[0].summary;
  const t = texts(layout('점수', m));
  assert.ok(t.includes(String(Math.round(s.score))) && t.includes('좋음') && t.includes('5%'), t.join('|'));
  const moon = texts(layout('달', m));
  assert.ok(moon.includes(m.nights[0].moon.name) && moon.some(x => /^월령 \d+\.\d$/.test(x)), moon.join('|'));
  assert.ok(texts(layout('지금', m)).includes('토성'));
  assert.equal(texts(layout('천체', m)).filter(x => /성$|^달$/.test(x)).length, 8);
  assert.equal(lockText(m).title, `관측 ${Math.round(s.score)} · 좋음`);
});

test('배치: 구름 칸은 등급색이 아니라 구름 양만큼 밝아지고, 48%부터 어두운 글자', () => {
  const cell = cloud => {
    const ops = layout('시간별', model({ cloud })).ops, i = ops.findIndex(o => o.op === 'text' && o.text === String(cloud) && o.size === 9.5);
    return { text: ops[i], base: ops[i - 2], over: ops[i - 1] };
  };
  const lo = cell(47), hi = cell(48);
  assert.equal(lo.base.fill, T.cbase); assert.equal(lo.over.fill, T.cloud); assert.equal(lo.over.alpha, 0.47);
  assert.equal(lo.text.color, T.ink);
  assert.equal(hi.text.color, T.bg);
});

test('배치: 결로 주의는 나쁨 표시와 함께 나온다', () => {
  const wet = layout('판정', model({ dew: 9.5 })), dry = layout('판정', model({ dew: 2 }));
  assert.ok(texts(wet).some(x => x.includes('결로')));
  assert.ok(!texts(dry).some(x => x.includes('결로')) && texts(dry).includes('없음'));
});

test('잠금 화면: 점수 고리 길이는 점수에 비례한다', () => {
  const len = score => {
    const m = model(); m.nights[0].summary.score = score;
    const arcs = lockCircle('점수', m).ops.filter(o => o.op === 'poly' && !o.close);
    return arcs.length ? arcs[0].pts.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - arcs[0].pts[i][0], q[1] - arcs[0].pts[i][1]), 0) : 0;
  };
  const full = 2 * Math.PI * 28;
  assert.ok(Math.abs(len(50) / full - 0.5) < 0.01); assert.ok(Math.abs(len(75) / full - 0.75) < 0.01);
  assert.equal(len(0), 0);
  assert.ok(lockCircle('달', model()).ops.some(o => o.op === 'poly' && o.close));
});

test('묶음: 선언 이름 뽑기', () => {
  assert.deepEqual(declNames('W = 390, GUTTER = 38, PLOT_H = 150;'), ['W', 'GUTTER', 'PLOT_H']);
  assert.deepEqual(declNames('clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));'), ['clamp']);
  assert.deepEqual(declNames("A = { b: 'x,y', c: [1, 2] }, B = `q,${1}`;"), ['A', 'B']);
});

test('묶음: 모듈마다 내보낸 이름이 원본 ES 모듈과 같고, 저장된 파일이 최신이다', async () => {
  const { code, modules } = bundle();
  for (const [id, names] of Object.entries(modules)) {
    const real = Object.keys(await import(new URL('../' + id, import.meta.url)));
    assert.deepEqual([...names].sort(), real.sort(), id);
  }
  assert.equal(readFileSync(new URL('../' + OUT, import.meta.url), 'utf8').replace(/\r\n/g, '\n'), code, 'node widget/build.mjs 를 다시 돌릴 것');
});

test('묶음: 가짜 Scriptable에서 모든 크기·종류가 오류 없이 위젯을 내놓는다', async () => {
  const { code } = bundle();
  const now = Date.now(), start = new Date(now + KST - 36 * 3600e3).toISOString().slice(0, 13) + ':00';
  let { fc, air } = fakeForecast(start, 24 * 7);
  const cases = [...Object.entries(KINDS).map(([k, f]) => [f, k]), ['small', null], ['extraLarge', '천체'], ['large', '기상 | 유리'], ['small', '유리'],
    ['accessoryInline', null], ['accessoryRectangular', null], ['accessoryCircular', null], ['accessoryCircular', '달']];
  let onWait = null, onFetch = null;
  const runCase = async (family, param, src, files = {}, apiCalls = 2) => {
    const log = { calls: [], widget: null, requests: [], files, waits: 0 };
    const rec = name => class { constructor(...a) { this.a = a; log.calls.push('new ' + name); } };
    class Path extends rec('Path') { move() {} addLine() {} addRect() {} addEllipse() {} closeSubpath() {}
      addRoundedRect(r, cw, ch) { assert.ok(cw <= r.a[2] / 2 + 1e-9 && ch <= r.a[3] / 2 + 1e-9, '모서리가 사각형보다 크다'); } }
    class DrawContext { constructor() { this.n = 0; this.texts = []; }
      setFont() {} setTextColor() {} setFillColor() {} setStrokeColor() {} setLineWidth() {} addPath() {} fillPath() { this.n++; } strokePath() { this.n++; }
      setTextAlignedLeft() {} setTextAlignedCenter() {} setTextAlignedRight() {}
      drawTextInRect(t) { assert.equal(typeof t, 'string'); this.texts.push(t); } getImage() { return { image: true, n: this.n, texts: this.texts }; } }
    class ListWidget { constructor() { this.texts = []; }
      setPadding() {} addText(t) { this.texts.push(t); return {}; } addImage(i) { this.image = i; return { centerAlignImage() {} }; }
      async presentSmall() {} async presentMedium() {} async presentLarge() {} }
    const font = () => ({});
    const ctx = vm.createContext({
      console, Date, Math, JSON, encodeURIComponent, Promise,
      config: { widgetFamily: family, runsInWidget: true }, args: { widgetParameter: param },
      Script: { setWidget: w => { log.widget = w; log.setAt = Date.now(); }, complete() { log.done = true; } },
      Request: class { constructor(url) { this.url = url; log.requests.push(url); } async loadJSON() { if (onFetch) onFetch(log.files); return JSON.parse(JSON.stringify(this.url.includes('air-quality') ? air : fc)); }
        async loadString() { this.response = { statusCode: 200 }; return code; } },
      FileManager: { local: () => ({ cacheDirectory: () => '/c', libraryDirectory: () => '/l', modificationDate: () => new Date(), joinPath: (a, b) => a + '/' + b, fileExists: p => p in log.files, readString: p => log.files[p], writeString: (p, s) => { log.files[p] = s; }, remove: p => { delete log.files[p]; } }) },
      Timer: { schedule: (ms, rep, f) => { log.waits++; if (onWait) onWait(log.files); setImmediate(f); } },
      ListWidget, DrawContext, Path, Size: rec('Size'), Rect: rec('Rect'), Point: rec('Point'),
      Color: class { constructor(hex, a) { assert.match(hex, /^#[0-9a-f]{6}$/, 'Scriptable의 Color는 #rrggbb만 받는다'); assert.ok(a >= 0 && a <= 1, `알파 ${a}`); } },
      Font: { mediumSystemFont: font, boldSystemFont: font, heavySystemFont: font, systemFont: font },
    });
    await vm.runInContext(`(async () => {\n${src}\n})()`, ctx);
    const label = `${family}/${param}`, w = log.widget;
    assert.ok(w && log.done, label);
    const api = log.requests.filter(u => u.includes('open-meteo'));
    assert.equal(api.length, apiCalls, label);
    if (apiCalls) assert.ok(api[0].startsWith('https://api.open-meteo.com/v1/forecast?latitude=36.019&longitude=129.343&'), api[0]);
    assert.ok(w.refreshAfterDate.getTime() > now && w.url.startsWith('https://'), label);
    if (family === 'accessoryInline') assert.match(w.texts[0], /^관측 \d+ · /);
    else if (family === 'accessoryRectangular') assert.equal(w.texts.length, 3);
    else if (family === 'accessoryCircular') assert.ok(w.image.n > 0, label);
    else assert.ok(w.backgroundImage.n >= 2 && w.backgroundImage.texts.length > 3, label);   // 바탕 + 칸·선
    return log;
  };
  for (const [family, param] of cases) await runCase(family, param, code);
  // 폰에 붙여 넣는 받아오기 스크립트로도 같은 위젯이 나오고, 받은 묶음을 저장해 둔다
  const viaLoader = await runCase('medium', '5일', readFileSync(new URL('../widget/loader.js', import.meta.url), 'utf8'));
  assert.equal(viaLoader.requests[0], 'https://chan7881.github.io/astronomy/widget/astro-widget.js');
  assert.equal(viaLoader.files['/l/astro-widget.cache.js'], code);
  // 여러 위젯이 한꺼번에: 다른 위젯이 받는 중(.lock이 방금 것)이면 예전 예보를 쓰고 받지 않는다
  const C = '/c/astro-36.019_129.343', stale = JSON.stringify({ at: now - 2 * 3600e3, fc, air });
  let r = await runCase('large', '기상', code, { [C + '.json']: stale, [C + '.lock']: String(Date.now() - 2e3) }, 0);
  assert.equal(r.waits, 0, '예전 것이 있으면 기다리지 않는다');
  // 받는 중 표시가 오래됐으면(멈춘 위젯) 무시하고 직접 받은 뒤 표시를 지운다
  r = await runCase('large', '기상', code, { [C + '.json']: stale, [C + '.lock']: String(Date.now() - 60e3) });
  assert.equal(C + '.lock' in r.files, false);
  assert.ok(JSON.parse(r.files[C + '.json']).at >= now, '새로 받은 것을 저장');
  // 처음(저장본 없음)인데 다른 위젯이 받는 중이면 기다렸다가 그 결과를 쓴다
  const shared = { [C + '.lock']: String(Date.now()) };
  onWait = files => { files[C + '.json'] = JSON.stringify({ at: Date.now(), fc, air }); };   // 첫 대기 동안 다른 위젯이 받아 둔다
  r = await runCase('large', '기상', code, shared, 0);
  onWait = null;
  assert.equal(r.waits, 1, '한 번 기다리고 그 결과를 썼다');
  // 예전 것이 6시간보다 오래됐고 다른 위젯이 계속 받는 중이면 기다리되, 겹쳐 받지 않고 5분 뒤 다시 고친다
  const veryOld = JSON.stringify({ at: now - 10 * 3600e3, fc, air });
  r = await runCase('large', '기상', code, { [C + '.json']: veryOld, [C + '.lock']: String(Date.now() + 60e3) }, 0);
  assert.equal(r.waits, 16);
  assert.ok(r.widget.refreshAfterDate.getTime() - r.setAt < 11 * 60e3, '곧 다시 고친다');
  // 기다리는 중 그 위젯이 실패하고 표시를 지우면 더 기다리지 않고 직접 받는다
  onWait = files => { delete files[C + '.lock']; };
  r = await runCase('large', '기상', code, { [C + '.json']: veryOld, [C + '.lock']: String(Date.now()) });
  onWait = null;
  assert.equal(r.waits, 1);
  // 받는 사이 다른 위젯이 표시를 덮어썼으면 그 표시는 지우지 않는다
  onFetch = files => { files[C + '.lock'] = 'other'; };
  r = await runCase('large', '기상', code);
  onFetch = null;
  assert.equal(r.files[C + '.lock'], 'other');
  // 위젯마다 다시 고칠 때가 어긋난다
  const late = r => Math.round((r.widget.refreshAfterDate.getTime() - r.setAt - 30 * 60e3) / 1e3);   // 30분 뒤에서 몇 초 더
  const d1 = late(await runCase('large', '기상', code)), d2 = late(await runCase('large', '기상 | 유리', code));
  assert.ok(d1 >= 0 && d1 <= 300 && d2 >= 0 && d2 <= 300, `${d1}, ${d2}`);
  assert.notEqual(d1, d2, '설정값이 다르면 어긋난다');
  // 점수가 0에 가까우면 막대가 모서리 반지름보다 낮아진다 — 그대로 넘기면 CoreGraphics가 죽는다
  ({ fc, air } = fakeForecast(start, 24 * 7, { cloud: 100 }));
  await runCase('medium', '5일', code);
});

test('지금 천체: 새벽 박명 뒤 아침 8시 전에도 낮으로 보고 다가오는 저녁을 본다', () => {
  const m = model({}, kst('2026-11-17T07:00'));          // 시민박명 시작 06:3x, nights[0]은 아직 16일 밤
  assert.equal(m.nights[0].day, 16);
  assert.equal(m.isNow, false);
  assert.equal(m.evalT, m.nights[1].night.civilEnd);
  assert.ok(m.evalT > kst('2026-11-17T17:13') && m.evalT < kst('2026-11-17T18:00'));
  assert.ok(m.nowBody.set > m.evalT, '지는 시각은 그 저녁 뒤');
  const dawn = model({}, kst('2026-11-17T05:00'));         // 아직 어둡다
  assert.equal(dawn.isNow, true); assert.equal(dawn.evalT, kst('2026-11-17T05:00'));
});

test('설정값: 쉼표로 나눠 적어도 종류·좌표·이름을 읽는다', () => {
  const a = parseParam('달, 36.17, 128.98', 'small');
  assert.equal(a.kind, '달'); assert.deepEqual([a.place.lat, a.place.lon], [36.17, 128.98]);
  const b = parseParam('36.17,128.98,보현산', 'small');
  assert.deepEqual(b.place, { name: '보현산', lat: 36.17, lon: 128.98, elev: 0 });
  const c = parseParam('보현산', 'small').place;   // 좌표가 없으면 내 위치 + 적은 이름
  assert.deepEqual([c.here, c.custom, c.name], [true, true, '보현산']);
  assert.equal(b.place.here, undefined);   // 좌표를 적으면 고정
});

test('달 모양: 남반구에서는 좌우가 바뀐다', () => {
  const cx = pts => pts.reduce((s, p) => s + p[0], 0) / pts.length;
  assert.ok(cx(moonShape(90, 100, 50, 20, 24, true)) < 95);
  const south = widgetModel(sky, { name: '시드니', lat: -33.9, lon: 151.2, elev: 0 }, null, NOW);
  const lit = spec => spec.ops.find(o => o.op === 'poly' && o.close && o.pts.length > 20).pts;
  const north = widgetModel(sky, POHANG, null, NOW);
  assert.ok(cx(lit(layout('달', north))) > 41 && cx(lit(layout('달', south))) < 41, '11월 16일은 차오르는 달');
  assert.ok(cx(lit(lockCircle('달', north))) > 33 && cx(lit(lockCircle('달', south))) < 33);
});

test('배치: 제목 줄이 없고 내용이 판 위쪽부터 쓴다(날짜는 안 나오고, 관측지 이름은 빈 자리에)', () => {
  const m = widgetModel(sky, { ...POHANG, name: '보현산천문대' }, fixture(), NOW);
  for (const kind of Object.keys(KINDS)) {
    const spec = layout(kind, m), [w, h] = SIZES[KINDS[kind]];
    assert.ok(!spec.ops.some(o => o.op === 'rect' && o.y === 0 && o.h < h), `${kind}: 머리띠`);
    assert.ok(!texts(spec).some(t => /11\.16/.test(t)), `${kind}: ${texts(spec).join('|')}`);
    assert.equal(texts(spec).filter(t => t.startsWith('보현')).length, 1, `${kind}: 이름`);
    const ys = spec.ops.filter(o => o.op !== 'poly' && o.op !== 'line' && !(o.op === 'rect' && o.h >= h)).map(o => (o.op === 'circle' ? o.cy - o.r : o.y));
    // 5일은 막대가 32에서 시작하고 그 위는 점수 글자 자리
    assert.ok(Math.min(...ys) <= (kind === '5일' ? 32 : 18), `${kind}: 맨 위 ${Math.min(...ys)}`);
    const bottom = Math.max(...spec.ops.filter(o => o.op === 'text').map(o => o.y + o.size * 1.2));
    assert.ok(bottom >= h - (h > 200 ? 40 : 26), `${kind}: 맨 아래 ${bottom.toFixed(1)} / ${h}`);
  }
});

test('배치: 구름 글자색은 보이는 숫자(반올림)로 정한다', () => {
  const ops = layout('시간별', model({ cloud: 47.6 })).ops;
  assert.equal(ops.find(o => o.op === 'text' && o.text === '48' && o.size === 9.5).color, T.bg);
});

test('설정값: 기상만 보는 위젯은 어느 이름을 적어도 그 크기의 것, 「유리」는 유리풍', () => {
  for (const name of ['기상', '날씨', '시간별']) {
    assert.deepEqual(['small', 'medium', 'large', 'extraLarge'].map(f => parseParam(name, f).kind), ['날씨', '시간별', '기상', '기상'], name);
  }
  assert.equal(parseParam('기상', 'accessoryCircular').kind, '기상');
  const p = parseParam('유리 | 기상 | 36.17, 128.98 | 보현산', 'large');
  assert.deepEqual([p.kind, p.glass, p.place.name, p.place.lat], ['기상', true, '보현산', 36.17]);
  assert.equal(parseParam('유리', 'medium').kind, '판정');
  assert.equal(parseParam('기상', 'large').glass, false);
});

test('기상 위젯: 큰 것은 본판과 같은 9줄 × 12시간, 작은 것은 4줄 × 3시간 간격', () => {
  const m = model({ cloud: 30 });
  const big = layout('기상', m), small = layout('날씨', m);
  const cells = spec => spec.ops.filter(o => o.op === 'text' && o.size === 9.5).map(o => o.text);
  const hours = spec => spec.ops.filter(o => o.op === 'text' && o.size === 9 && o.weight === 'm').map(o => o.text);
  assert.deepEqual(texts(big).filter(x => /^(상층|중층|하층|시상|제트|투명|이슬|기온|바람)$/.test(x)), ['상층', '중층', '하층', '시상', '제트', '투명', '이슬', '기온', '바람']);
  assert.deepEqual(hours(big), ['18', '19', '20', '21', '22', '23', '00', '01', '02', '03', '04', '05']);
  assert.equal(cells(big).length, 9 * 12);
  // 흉내 자료: 하층 30 · 중층 0 · 상층 0 · 에어로졸 0.1 · 기온 10 · 바람 2
  const row = (spec, i, n) => cells(spec).slice(i * n, i * n + n);
  assert.deepEqual([0, 1, 2, 5, 7, 8].map(i => row(big, i, 12)[0]), ['0', '0', '30', '.10', '10', '2']);
  assert.ok(row(big, 2, 12).every(x => x === '30') && row(big, 0, 12).every(x => x === '0'));
  assert.deepEqual(hours(small), ['18', '21', '00', '03']);
  assert.equal(cells(small).length, 4 * 4);
  assert.ok(row(small, 0, 4).every(x => x === '30'));
  // 칸이 판 안에 있고 줄끼리 겹치지 않는다
  for (const [spec, n] of [[big, 12], [small, 4]]) {
    const rects = spec.ops.filter(o => o.op === 'rect' && o.r === 3 && o.alpha == null);
    assert.ok(rects.every(o => o.x >= 0 && o.x + o.w <= spec.w && o.y >= 8 && o.y + o.h <= spec.h - 12), '칸이 판 밖');
    const ys = [...new Set(rects.map(o => +o.y.toFixed(3)))].sort((a, b) => a - b);
    assert.equal(ys.length, spec === big ? 9 : 4);
    for (let i = 1; i < ys.length; i++) assert.ok(ys[i] - ys[i - 1] >= rects[0].h + 0.999, '줄이 겹친다');
    assert.equal(rects.filter(o => o.y === rects[0].y).length, n);
  }
});

test('유리풍: 글귀는 같고 바탕·칸 색만 다르며, 그린 뒤 평면 색으로 돌아온다', () => {
  const m = model({ cloud: 95, dew: 9.5 });
  for (const kind of Object.keys(KINDS)) {
    const flat = layout(kind, m), glass = layout(kind, m, { glass: true });
    assert.deepEqual(texts(glass), texts(flat), kind);
    assert.deepEqual([flat.ops[0].op, flat.ops[0].fill], ['rect', T.card], kind);
    assert.equal(glass.ops[0].op, 'poly', kind);
    const rim = glass.ops.at(-1);
    assert.deepEqual([rim.op, rim.fill, rim.w, rim.h], ['rect', undefined, glass.w - 1, glass.h - 1], kind);
    for (const o of [...flat.ops, ...glass.ops]) for (const c of [o.fill, o.stroke, o.color]) if (c != null) assert.match(c, /^#[0-9a-f]{6}([0-9a-f]{2})?$/, `${kind}: ${c}`);
    assert.ok(!flat.ops.some(o => [o.fill, o.stroke, o.color].some(c => c && c.length === 9)), `${kind}: 평면에 반투명 색`);
  }
  assert.equal(T.glass, false);
  // 빛은 왼쪽 위가 가장 밝고 오른쪽 아래로 갈수록 어둡다
  const strips = layout('기상', m, { glass: true }).ops.filter(o => o.op === 'poly' && o.close && o.pts.length === 4).map(o => parseInt(o.fill.slice(1, 3), 16));
  assert.equal(strips.length, 36);
  assert.ok(strips.every((v, i) => i === 0 || v <= strips[i - 1]) && strips[0] > strips.at(-1) + 20, strips.join(','));
});

test('색: 위젯의 평면 색은 본판 style.css와 같다', () => {
  const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8').match(/:root \{([^}]*)\}/)[1];
  const v = name => css.match(new RegExp(`--${name}: (#[0-9a-f]+)`))[1];
  const pairs = { bg: T.bg, card: T.card, band: T.band, line: T.line, edge: T.edge, ink: T.ink, ink2: T.ink2, ink3: T.ink3, good: T.g, mid: T.m, bad: T.b,
    'g-g': T.cell.g, 'g-m': T.cell.m, 'g-b': T.cell.b, 'g-p': T.cell.p, na: T.na, cloud: T.cloud, cbase: T.cbase, tw0: T.tw[0], tw4: T.tw[4], 'b-Mars': T.body.Mars, 'b-Moon': T.body.Moon };
  for (const [name, val] of Object.entries(pairs)) assert.equal(v(name), val, name);
});

test('기상 위젯: 여러 시간을 묶은 칸은 구름은 평균, 시상·제트는 가장 큰 값, 이슬점 차는 가장 작은 값', () => {
  assert.equal(blockValue([0, 100, 100], 'mean'), 200 / 3);
  assert.equal(blockValue([1.2, 2.5, 1.8], 'max'), 2.5);
  assert.equal(blockValue([4, 0.8, 3], 'min'), 0.8);
  assert.equal(blockValue([NaN, 30, null], 'mean'), 30);
  assert.ok(Number.isNaN(blockValue([NaN, undefined], 'max')));
  assert.equal(blockValue([7], undefined), 7);
  // 작은 위젯: 21시 맑음 · 22~23시 흐림이면 21시 칸은 맑음이 아니라 평균 67
  const m = model({ cloud: 0 }), v = m.nights[0];
  const at = h => v.hours.find(x => new Date(x.t + KST).getUTCHours() === h);
  at(22).cloud = 100; at(23).cloud = 100; at(22).spread = 0.5;
  const ops = layout('날씨', m).ops, cells = ops.filter(o => o.op === 'text' && o.size === 9.5).map(o => o.text);
  assert.deepEqual(cells.slice(0, 4), ['0', '67', '0', '0']);
  assert.equal(cells[12 + 1], '0.5');
});

test('색: 구름 칸 글자색이 바뀌는 경계에서 고른 글자가 다른 글자보다 잘 보인다', async () => {
  const { CLOUD_INK_FLIP } = await import('../js/charts.js');
  const rgb = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
  const lum = c => c.map(x => x / 255).map(x => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)).reduce((s, x, i) => s + x * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
  const cell = p => rgb(T.cbase).map((b, i) => b + (rgb(T.cloud)[i] - b) * p / 100);
  for (const p of [0, 20, CLOUD_INK_FLIP - 1]) assert.ok(ratio(cell(p), rgb(T.ink)) > ratio(cell(p), rgb(T.bg)), `${p}%`);
  for (const p of [CLOUD_INK_FLIP, 70, 100]) assert.ok(ratio(cell(p), rgb(T.bg)) > ratio(cell(p), rgb(T.ink)), `${p}%`);
  for (let p = 0; p <= 100; p++) assert.ok(ratio(cell(p), rgb(p >= CLOUD_INK_FLIP ? T.bg : T.ink)) >= 3.5, `${p}%`);
});

test('상세 표: 그날 정오부터 다음 날 정오까지 25시간이고, 밤 구간(hours)은 그대로다', () => {
  const data = fixture(), noon = baseNoon(NOW, KST), v = nightView(sky, POHANG, data, noon);
  assert.equal(v.day.length, 25);
  assert.equal(v.day[0].t, kst('2026-11-16T12:00'));
  assert.equal(v.day.at(-1).t, kst('2026-11-17T12:00'));
  assert.ok(v.day.every((h, i) => i === 0 || h.t - v.day[i - 1].t === 3600e3));
  assert.ok(v.day.every(h => Number.isFinite(h.seeing) && Number.isFinite(h.jet)), '낮 시간에도 시상·제트가 계산된다');
  assert.ok(v.hours.length < v.day.length && v.hours.every(h => h.t >= v.t0 - 1800e3 && h.t <= v.t1 + 1800e3));
  assert.ok(v.hours.every(h => v.day.some(d => d.t === h.t && d.seeing === h.seeing)));
});

test('상세 표: 칸은 기상 띠와 같은 규칙으로 칠한다', async () => {
  const { detailCell, CLOUD_INK_FLIP } = await import('../js/charts.js');
  assert.equal(detailCell('0', { kind: 'cloud', value: 0 }), '<td class="cc" style="--c:0%">0</td>');
  assert.equal(detailCell('47', { kind: 'cloud', value: CLOUD_INK_FLIP - 1 }), '<td class="cc" style="--c:47%">47</td>');
  assert.equal(detailCell('48', { kind: 'cloud', value: CLOUD_INK_FLIP }), '<td class="cc hi" style="--c:48%">48</td>');
  assert.equal(detailCell('100', { kind: 'cloud', value: 130 }), '<td class="cc hi" style="--c:100%">100</td>');
  assert.equal(detailCell('–', { kind: 'cloud', value: null }), '<td>–</td>');
  assert.equal(detailCell('1.2', { kind: 'grade', grade: 'g' }), '<td class="g-g">1.2</td>');
  assert.equal(detailCell('35', { kind: 'grade', grade: 'b' }), '<td class="g-b">35</td>');
  assert.equal(detailCell('–', { kind: 'grade', grade: null }), '<td>–</td>');
  assert.equal(detailCell('10'), '<td>10</td>');
});

test('받아오기: 저장본이 방금 것이어도 서버 판이 바뀌었으면 새 판을 쓰고, 그대로면(304) 저장본을 쓴다', async () => {
  const src = readFileSync(new URL('../widget/loader.js', import.meta.url), 'utf8');
  const run = async (files, server) => {
    const sent = [];
    const ctx = vm.createContext({
      Date, Object, String,
      Request: class { constructor(url) { this.url = url; this.headers = {}; }
        async loadString() { sent.push(this.headers); const r = server(this.headers); if (r.throw) throw new Error('offline'); this.response = r; return r.body ?? ''; } },
      FileManager: { local: () => ({ libraryDirectory: () => '/l', joinPath: (a, b) => a + '/' + b, remove: p => { delete files[p]; },
        fileExists: p => p in files, readString: p => files[p], writeString: (p, s) => { files[p] = s; } }) },
    });
    await vm.runInContext(`(async () => {\n${src}\n})()`, ctx);
    return { ran: ctx.ran, files, sent };
  };
  const OLD = '// ASTRO_WIDGET\nglobalThis.ran = "old";', NEW = '// ASTRO_WIDGET\nglobalThis.ran = "new";';
  const server = h => h['If-None-Match'] === '"v2"' ? { statusCode: 304, headers: {} } : { statusCode: 200, headers: { Etag: '"v2"' }, body: NEW };
  // 예전 받아오기가 남긴 방금 저장본(ETag 없음) — 6시간을 기다리지 않고 새 판으로
  let r = await run({ '/l/astro-widget.cache.js': OLD }, server);
  assert.equal(r.ran, 'new');
  assert.equal(r.files['/l/astro-widget.etag'], '"v2"');
  // 판이 같으면 304, 저장본 그대로
  r = await run({ '/l/astro-widget.cache.js': NEW, '/l/astro-widget.etag': '"v2"' }, server);
  assert.equal(r.ran, 'new');
  assert.equal(r.sent[0]['If-None-Match'], '"v2"');
  // 서버 판이 바뀌면(ETag 다름) 새로 받는다
  r = await run({ '/l/astro-widget.cache.js': OLD, '/l/astro-widget.etag': '"v1"' }, server);
  assert.equal(r.ran, 'new');
  // 받지 못하면 저장본
  r = await run({ '/l/astro-widget.cache.js': OLD, '/l/astro-widget.etag': '"v1"' }, () => ({ throw: true }));
  assert.equal(r.ran, 'old');
  // 처음(저장본 없음)에는 표를 보내지 않는다 — 남은 표만 있어도 마찬가지
  r = await run({ '/l/astro-widget.etag': '"v2"' }, server);
  assert.equal(r.ran, 'new');
  assert.equal(r.sent[0]['If-None-Match'], undefined);
  // 200이어도 위젯 묶음이 아니면(와이파이 로그인 화면 등) 저장본을 덮지 않는다
  r = await run({ '/l/astro-widget.cache.js': OLD }, () => ({ statusCode: 200, headers: { etag: '"x"' }, body: '<html>login</html>' }));
  assert.equal(r.ran, 'old');
  assert.equal(r.files['/l/astro-widget.cache.js'], OLD);
  assert.equal('/l/astro-widget.etag' in r.files, false);
  // 3분 안에 다른 위젯이 물었으면 묻지 않고 저장본 — 위젯 여러 개가 한꺼번에 깨어날 때
  r = await run({ '/l/astro-widget.cache.js': OLD, '/l/astro-widget.asked': String(Date.now() - 60e3) }, server);
  assert.equal(r.ran, 'old'); assert.equal(r.sent.length, 0);
  // 3분이 지났으면 다시 묻고 물은 시각을 남긴다
  r = await run({ '/l/astro-widget.cache.js': OLD, '/l/astro-widget.asked': String(Date.now() - 200e3) }, server);
  assert.equal(r.ran, 'new'); assert.ok(Date.now() - Number(r.files['/l/astro-widget.asked']) < 5e3);
  // 묻다 실패하면 물은 표시를 지워 다음 위젯이 다시 묻게 한다
  r = await run({ '/l/astro-widget.cache.js': OLD }, () => ({ throw: true }));
  assert.equal('/l/astro-widget.asked' in r.files, false);
  // 저장본이 없으면 방금 물었어도 묻는다
  r = await run({ '/l/astro-widget.asked': String(Date.now()) }, server);
  assert.equal(r.ran, 'new');
  // ETag 없이 새 판이 오면 옛 표를 지운다
  r = await run({ '/l/astro-widget.cache.js': OLD, '/l/astro-widget.etag': '"v1"' }, () => ({ statusCode: 200, headers: {}, body: NEW }));
  assert.equal(r.ran, 'new');
  assert.equal('/l/astro-widget.etag' in r.files, false);
});

test('내 위치: 설정값을 비우거나 「현재」만 적으면 내 위치, 좌표를 적으면 고정', () => {
  for (const t of [null, '', '현재', '달 | 내 위치', '여기']) {
    const p = parseParam(t, 'small').place;
    assert.equal(p.here, true, String(t)); assert.equal(p.custom, false, String(t)); assert.equal(p.name, '내 위치');
  }
  assert.equal(parseParam('달 | 내 위치', 'small').kind, '달');
  assert.equal(parseParam('현재 | 36.17, 128.98', 'small').place.here, undefined);
});

test('내 위치: 0.01°로 반올림하고, 지명은 읍·면·동을 먼저', () => {
  assert.deepEqual([roundHere(36.0194), roundHere(36.0151), roundHere(-33.8749)], [36.02, 36.02, -33.87]);
  assert.equal(hereName({ subLocality: '대잠동', locality: '포항시 남구', administrativeArea: '경상북도' }), '대잠동');
  assert.equal(hereName({ locality: '포항시 북구 청하면', administrativeArea: '경상북도' }), '청하면');
  assert.equal(hereName({ locality: '포항시', administrativeArea: '경상북도' }), '포항시');
  assert.equal(hereName({ locality: 'Sydney', administrativeArea: 'NSW' }), 'Sydney');
  assert.equal(hereName({ name: 'Somewhere' }), 'Somewhere');
  assert.equal(hereName(null), null);
});

// Scriptable 흉내: 파일은 Map, 위치는 지정한 값(또는 실패), 타이머는 setTimeout
function fakeScriptable({ pos, geo, files = new Map() } = {}) {
  const calls = { current: 0, geocode: 0 };
  globalThis.FileManager = { local: () => ({
    cacheDirectory: () => '/c', joinPath: (a, b) => a + '/' + b,
    fileExists: p => files.has(p), readString: p => files.get(p), writeString: (p, v) => files.set(p, v),
  }) };
  globalThis.Timer = { schedule: (ms, rep, f) => setTimeout(f, Math.min(ms, 20)) };
  globalThis.Location = {
    setAccuracyToThreeKilometers() {},
    current: async () => { calls.current++; if (!pos) throw new Error('권한 없음'); return pos; },
    reverseGeocode: async () => { calls.geocode++; return geo ? [geo] : []; },
  };
  return { files, calls };
}
const { resolveHere } = await import('../widget/app.js');

test('내 위치 읽기: 반올림한 좌표 + 동 이름, 10분 안에는 다시 묻지 않는다', async () => {
  const f = fakeScriptable({ pos: { latitude: 36.0194, longitude: 129.3431 }, geo: { subLocality: '대잠동', locality: '포항시 남구' } });
  const asked = parseParam('', 'small').place;
  const a = await resolveHere(asked);
  assert.deepEqual([a.lat, a.lon, a.name, a.here], [36.02, 129.34, '대잠동', true]);
  const b = await resolveHere(asked);
  assert.deepEqual([b.lat, b.name], [36.02, '대잠동']);
  assert.deepEqual(f.calls, { current: 1, geocode: 1 });
  assert.equal((await resolveHere(parseParam('집', 'small').place)).name, '집');   // 적은 이름이 먼저
});

test('내 위치 읽기: 위치를 못 읽으면 마지막 위치, 그것도 없으면 포항(화살표 없음)', async () => {
  fakeScriptable({ pos: null });
  const p = await resolveHere(parseParam('', 'small').place);
  assert.deepEqual([p.name, p.lat, p.here], ['포항', 36.019, undefined]);
  const old = new Map([['/c/astro-here.json', JSON.stringify({ at: Date.now() - 3600e3, lat: 36.2, lon: 129.34, name: '청하면' })]]);
  fakeScriptable({ pos: null, files: old });
  const q = await resolveHere(parseParam('', 'small').place);
  assert.deepEqual([q.name, q.lat, q.here], ['청하면', 36.2, true]);
});

test('내 위치 읽기: 1시간 지난 저장본은 다시 묻고, 같은 자리면 지명은 묻지 않는다', async () => {
  const old = new Map([['/c/astro-here.json', JSON.stringify({ at: Date.now() - 3600e3, lat: 36.02, lon: 129.34, name: '대잠동' })]]);
  const f = fakeScriptable({ pos: { latitude: 36.021, longitude: 129.339 }, geo: { subLocality: '다른동' }, files: old });
  const p = await resolveHere(parseParam('', 'small').place);
  assert.equal(p.name, '대잠동');
  assert.deepEqual(f.calls, { current: 1, geocode: 0 });
});

test('관측지 이름: 13종 모두 한 번, 다른 글자와 겹치지 않고 판 안에. 내 위치일 때만 화살표', () => {
  const box = o => { const w = textWidth(o.text, o.size), x = o.align === 'l' ? o.x : o.align === 'r' ? o.x - w : o.x - w / 2; return [x, o.y, x + w, o.y + o.size * 1.2]; };
  const hit = (a, b) => a[0] < b[2] - 0.5 && b[0] < a[2] - 0.5 && a[1] < b[3] - 0.5 && b[1] < a[3] - 0.5;
  for (const name of ['보현산천문대 주차장', '대잠동']) {
    for (const here of [true, false]) {
      const m = widgetModel(sky, { ...POHANG, name, here }, fixture(), NOW);
      for (const kind of Object.keys(KINDS)) {
        const spec = layout(kind, m), ts = spec.ops.filter(o => o.op === 'text');
        const mine = ts.filter(o => o.text.startsWith(name.slice(0, 2)));
        assert.equal(mine.length, 1, `${kind} ${name}`);
        const b = box(mine[0]);
        assert.ok(b[0] >= 4 && b[2] <= spec.w - 4 && b[3] <= spec.h - 2, `${kind}: 판 밖 ${b.map(v => v.toFixed(1))}`);
        for (const o of ts) if (o !== mine[0]) assert.ok(!hit(b, box(o)), `${kind}: 「${mine[0].text}」가 「${o.text}」와 겹친다`);
        const arrows = spec.ops.filter(o => o.op === 'poly' && o.close && o.pts.length === 4 && Math.abs(o.pts[0][1] - mine[0].y - mine[0].size * 0.3) < 0.01);
        assert.equal(arrows.length, here ? 1 : 0, `${kind}: 화살표`);
      }
    }
  }
});

test('내 위치 읽기: 지명을 못 찾으면 「내 위치」로 보이되 저장하지 않고 다음에 다시 묻는다, 깨진 저장본은 버린다', async () => {
  const f = fakeScriptable({ pos: { latitude: 36.02, longitude: 129.34 }, geo: null });
  assert.equal((await resolveHere(parseParam('', 'small').place)).name, '내 위치');
  const saved = JSON.parse(f.files.get('/c/astro-here.json'));
  saved.at -= 3600e3; f.files.set('/c/astro-here.json', JSON.stringify(saved));
  const g = fakeScriptable({ pos: { latitude: 36.02, longitude: 129.34 }, geo: { subLocality: '대잠동' }, files: f.files });
  assert.equal((await resolveHere(parseParam('', 'small').place)).name, '대잠동');
  assert.equal(g.calls.geocode, 1);
  fakeScriptable({ pos: null, files: new Map([['/c/astro-here.json', '{"at":1}']]) });
  assert.equal((await resolveHere(parseParam('', 'small').place)).name, '포항');
});

test('유동 글자 크기: 한 달(모든 위상) 동안 13종 글자가 판 밖으로 나가지 않고, 긴 달 이름만 작아진다', () => {
  const seen = new Map();
  for (let k = 0; k < 30; k++) {
    const day = new Date(Date.parse('2026-11-16T00:00Z') + k * 864e5).toISOString().slice(0, 10);
    const start = new Date(Date.parse(day + 'T00:00Z') - 864e5).toISOString().slice(0, 16);
    const { fc, air } = fakeForecast(start, 24 * 7), m = widgetModel(sky, POHANG, normalize(fc, air), kst(day + 'T21:10'));
    for (const kind of Object.keys(KINDS)) {
      const spec = layout(kind, m), [w] = SIZES[KINDS[kind]];
      for (const o of spec.ops.filter(o => o.op === 'text')) {
        const tw = textWidth(o.text, o.size), left = o.align === 'l' ? o.x : o.align === 'c' ? o.x - tw / 2 : o.x - tw;
        assert.ok(left >= 2 && left + tw <= w - 2, `${day} ${kind}: 「${o.text}」 ${left.toFixed(1)}~${(left + tw).toFixed(1)} / ${w}`);
      }
    }
    const name = m.nights[0].moon.name, t = layout('달', m).ops.find(o => o.op === 'text' && o.text === name);
    seen.set(name, t.size);
  }
  assert.ok(seen.has('차오르는 달') && seen.has('기우는 달') && seen.has('초승달'), [...seen.keys()].join(','));
  for (const n of ['차오르는 달', '기우는 달']) {
    const z = seen.get(n);
    assert.ok(z < 16 && z >= 16 * 0.6 && 86 + textWidth(n, z) <= 158 - 14 + 0.01, `${n} ${z}`);   // 관측지 이름과 같은 오른쪽 여백(PAD)
  }
  const long = fitText({ text: '아주아주 긴 글귀입니다', size: 10, y: 0 }, 50);   // 0.6배로도 안 들어가면 뒤를 …로
  assert.ok(long.size === 6 && long.text.endsWith('…') && textWidth(long.text, 6) <= 50, JSON.stringify(long));
  assert.equal(seen.get('초승달'), 16, '짧은 이름은 원래 크기');
});
