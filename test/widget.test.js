import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { makeSky } from '../js/sky.js';
import { normalize, LEVELS } from '../js/api.js';
import { baseNoon, nightView } from '../js/view.js';
import { widgetModel, highestBody, bandHours } from '../widget/data.js';
import { layout, lockText, lockCircle, moonShape, dashes, textWidth, fit, KINDS, SIZES } from '../widget/layout.js';
import { parseParam } from '../widget/param.js';
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
  assert.deepEqual(parseParam(null, 'small'), { kind: '점수', place: { ...POHANG, region: '경상북도 · 대한민국' } });
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

test('배치: 11종 모두 크기에 맞고, 좌표가 유한하고, 글자가 판 밖으로 나가지 않는다', () => {
  for (const opt of [{}, { cloud: 95, dew: 9.5 }]) {
    const m = model(opt);
    for (const kind of Object.keys(KINDS)) {
      const spec = layout(kind, m), [w, h] = SIZES[KINDS[kind]];
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

test('배치: 자료가 없어도(예보 실패) 11종이 그려진다', () => {
  const m = widgetModel(sky, POHANG, null, NOW);
  assert.equal(m.nights[0].summary, null);
  for (const kind of Object.keys(KINDS)) assert.ok(layout(kind, m).ops.length > 3, kind);
  assert.ok(texts(layout('시간별', m)).includes('예보 자료 없음'));
  assert.equal(lockText(m).inline, '관측 –');
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

test('배치: 구름 칸은 등급색이 아니라 구름 양만큼 밝아지고, 40%부터 어두운 글자', () => {
  const cell = cloud => {
    const ops = layout('시간별', model({ cloud })).ops, i = ops.findIndex(o => o.op === 'text' && o.text === String(cloud) && o.size === 9.5);
    return { text: ops[i], base: ops[i - 2], over: ops[i - 1] };
  };
  const lo = cell(39), hi = cell(40);
  assert.equal(lo.base.fill, T.cbase); assert.equal(lo.over.fill, T.cloud); assert.equal(lo.over.alpha, 0.39);
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
  assert.equal(readFileSync(new URL('../' + OUT, import.meta.url), 'utf8'), code, 'node widget/build.mjs 를 다시 돌릴 것');
});

test('묶음: 가짜 Scriptable에서 모든 크기·종류가 오류 없이 위젯을 내놓는다', async () => {
  const { code } = bundle();
  const now = Date.now(), start = new Date(now + KST - 36 * 3600e3).toISOString().slice(0, 13) + ':00';
  let { fc, air } = fakeForecast(start, 24 * 7);
  const cases = [...Object.entries(KINDS).map(([k, f]) => [f, k]), ['small', null], ['extraLarge', '천체'],
    ['accessoryInline', null], ['accessoryRectangular', null], ['accessoryCircular', null], ['accessoryCircular', '달']];
  const runCase = async (family, param, src) => {
    const log = { calls: [], widget: null, requests: [], files: {} };
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
      Script: { setWidget: w => { log.widget = w; }, complete() { log.done = true; } },
      Request: class { constructor(url) { this.url = url; log.requests.push(url); } async loadJSON() { return JSON.parse(JSON.stringify(this.url.includes('air-quality') ? air : fc)); }
        async loadString() { this.response = { statusCode: 200 }; return code; } },
      FileManager: { local: () => ({ cacheDirectory: () => '/c', libraryDirectory: () => '/l', modificationDate: () => new Date(), joinPath: (a, b) => a + '/' + b, fileExists: p => p in log.files, readString: p => log.files[p], writeString: (p, s) => { log.files[p] = s; } }) },
      ListWidget, DrawContext, Path, Size: rec('Size'), Rect: rec('Rect'), Point: rec('Point'), Color: rec('Color'),
      Font: { mediumSystemFont: font, boldSystemFont: font, heavySystemFont: font, systemFont: font },
    });
    await vm.runInContext(`(async () => {\n${src}\n})()`, ctx);
    const label = `${family}/${param}`, w = log.widget;
    assert.ok(w && log.done, label);
    const api = log.requests.filter(u => u.includes('open-meteo'));
    assert.equal(api.length, 2, label);
    assert.ok(api[0].startsWith('https://api.open-meteo.com/v1/forecast?latitude=36.019&longitude=129.343&'), api[0]);
    assert.ok(w.refreshAfterDate.getTime() > now && w.url.startsWith('https://'), label);
    if (family === 'accessoryInline') assert.match(w.texts[0], /^관측 \d+ · /);
    else if (family === 'accessoryRectangular') assert.equal(w.texts.length, 3);
    else if (family === 'accessoryCircular') assert.ok(w.image.n > 0, label);
    else assert.ok(w.backgroundImage.n >= 3 && w.backgroundImage.texts.length > 3, label);
    return log;
  };
  for (const [family, param] of cases) await runCase(family, param, code);
  // 폰에 붙여 넣는 받아오기 스크립트로도 같은 위젯이 나오고, 받은 묶음을 저장해 둔다
  const viaLoader = await runCase('medium', '5일', readFileSync(new URL('../widget/loader.js', import.meta.url), 'utf8'));
  assert.equal(viaLoader.requests[0], 'https://chan7881.github.io/astronomy/widget/astro-widget.js');
  assert.equal(viaLoader.files['/l/astro-widget.cache.js'], code);
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
  assert.equal(parseParam('보현산', 'small').place.name, '포항');   // 좌표가 없으면 포항 그대로
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

test('배치: 긴 관측지 이름은 머리띠에서 잘린다', () => {
  assert.equal(fit('포항', 11, 80), '포항');
  assert.equal(fit('보현산천문대관측소', 11, 60), '보현산천…');
  const m = widgetModel(sky, { ...POHANG, name: '보현산천문대제2관측소옥상' }, fixture(), NOW);
  for (const kind of Object.keys(KINDS)) {
    const [title, right] = layout(kind, m).ops.filter(o => o.op === 'text'), w = SIZES[KINDS[kind]][0];
    assert.ok(14 + textWidth(title.text, 11) < w - 14 - textWidth(right.text, 11), `${kind}: ${title.text} / ${right.text}`);
  }
});

test('배치: 구름 글자색은 보이는 숫자(반올림)로 정한다', () => {
  const ops = layout('시간별', model({ cloud: 39.6 })).ops;
  assert.equal(ops.find(o => o.op === 'text' && o.text === '40' && o.size === 9.5).color, T.bg);
});
