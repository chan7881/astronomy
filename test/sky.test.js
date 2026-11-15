import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeSky, BODIES } from '../js/sky.js';
import { hourTicks, scale, altY } from '../js/charts.js';
import { localIsoToMs, normalize, LEVELS } from '../js/api.js';

// 브라우저용 묶음을 그대로 읽어 쓴다(배포본과 같은 파일을 검사하려고).
const mod = { exports: {} };
new Function('module', 'exports', readFileSync(new URL('../vendor/astronomy.browser.min.js', import.meta.url), 'utf8'))(mod, mod.exports);
const sky = makeSky(mod.exports);

const POHANG = { lat: 36.019, lon: 129.343, elev: 20 };
const kst = s => Date.parse(s + '+09:00');
const within = (t, iso, min) => assert.ok(Math.abs(t - kst(iso)) <= min * 60e3, `${new Date(t + 9 * 3600e3).toISOString().slice(0, 16)} ≉ ${iso} (±${min}분)`);

test('포항 2026-11-16 밤: 해짐·해뜸·박명 순서와 시각', () => {
  const n = sky.night(POHANG, kst('2026-11-16T12:00'));
  within(n.sunset, '2026-11-16T17:14', 2);
  within(n.sunrise, '2026-11-17T07:00', 2);
  const order = [n.sunset, n.civilEnd, n.nautEnd, n.astroEnd, n.astroStart, n.nautStart, n.civilStart, n.sunrise];
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});

test('남중 때 고도가 가장 높고, 남중 방위는 남쪽(북반구 중위도)', () => {
  const noon = kst('2026-11-16T12:00');
  const e = sky.events('Saturn', POHANG, noon);
  const at = sky.altAz('Saturn', POHANG, e.transit);
  assert.ok(Math.abs(at.az - 180) < 1, `방위 ${at.az}`);
  assert.ok(Math.abs(at.alt - e.transitAlt) < 0.2);
  assert.ok(at.alt > sky.altAz('Saturn', POHANG, e.transit - 3600e3).alt);
  assert.ok(at.alt > sky.altAz('Saturn', POHANG, e.transit + 3600e3).alt);
});

test('뜰 때 동쪽·질 때 서쪽이고 그때 고도는 0에 가깝다', () => {
  const e = sky.events('Jupiter', POHANG, kst('2026-11-16T12:00'));
  const r = sky.altAz('Jupiter', POHANG, e.rise), s = sky.altAz('Jupiter', POHANG, e.set);
  assert.ok(r.az > 0 && r.az < 180 && s.az > 180 && s.az < 360);
  assert.ok(Math.abs(r.alt) < 1 && Math.abs(s.alt) < 1);
});

test('달: 2026-11-16 저녁은 상현 직전의 초승달(약 39%)', () => {
  const m = sky.moon(kst('2026-11-16T18:00'));
  assert.equal(m.name, '초승달');
  assert.ok(Math.abs(m.frac - 0.39) < 0.02, String(m.frac));
  assert.ok(m.deg > 0 && m.deg < 90);
});

test('제원: 금성이 목성보다 밝고(등급이 작고), 시직경은 알려진 범위', () => {
  const t = kst('2026-11-17T05:00');
  const f = Object.fromEntries(BODIES.map(b => [b.id, sky.facts(b.id, POHANG, t)]));
  assert.ok(f.Venus.mag < f.Jupiter.mag && f.Jupiter.mag < f.Saturn.mag);
  assert.ok(f.Moon.diam / 60 > 29 && f.Moon.diam / 60 < 34);
  assert.ok(f.Jupiter.diam > 30 && f.Jupiter.diam < 51);
  assert.ok(f.Saturn.diam > 14 && f.Saturn.diam < 21);
});

test('자취: 시간순이고 끝 시각까지 든다', () => {
  const t0 = kst('2026-11-16T17:00'), t1 = kst('2026-11-17T07:00');
  const tr = sky.track('Moon', POHANG, t0, t1, 10);
  assert.equal(tr.length, 14 * 6 + 1);
  assert.equal(tr.at(-1).t, t1);
});

test('눈금: 현지 시각 3시간마다', () => {
  const sc = scale(kst('2026-11-16T16:54'), kst('2026-11-17T07:20'));
  assert.deepEqual(hourTicks(sc, 9 * 3600).map(k => k.label), ['18', '21', '00', '03', '06']);
  assert.equal(sc.x(sc.t0), 0); assert.equal(sc.x(sc.t1), 390);
  assert.ok(altY(60) < altY(30) && altY(30) < altY(0));   // 높을수록 위(작은 y)
});

test('예보 정규화: 현지 시각을 epoch로, 기압면을 묶음으로', () => {
  assert.equal(localIsoToMs('2026-11-16T21:00', 9 * 3600), Date.parse('2026-11-16T12:00:00Z'));
  const hourly = { time: ['2026-11-16T21:00'], temperature_2m: [8], dew_point_2m: [3], relative_humidity_2m: [70], cloud_cover: [10], cloud_cover_low: [1], cloud_cover_mid: [2], cloud_cover_high: [3], wind_speed_10m: [2], wind_direction_10m: [270], wind_gusts_10m: [4] };
  for (const p of LEVELS) { hourly[`temperature_${p}hPa`] = [-p / 100]; hourly[`geopotential_height_${p}hPa`] = [16000 - p * 16]; hourly[`wind_speed_${p}hPa`] = [20]; hourly[`wind_direction_${p}hPa`] = [270]; }
  const air = { utc_offset_seconds: 32400, hourly: { time: ['2026-11-16T21:00'], aerosol_optical_depth: [0.2] } };
  const d = normalize({ utc_offset_seconds: 32400, elevation: 20, timezone: 'Asia/Seoul', hourly }, air);
  assert.equal(d.hours.length, 1);
  const h = d.hours[0];
  assert.equal(h.t, Date.parse('2026-11-16T12:00:00Z'));
  assert.deepEqual([h.low, h.mid, h.high, h.aod], [1, 2, 3, 0.2]);
  assert.equal(h.levels.length, LEVELS.length);
  assert.deepEqual(h.levels[0], { p: 1000, T: -10, z: 0, ws: 20, wd: 270 });
});

test('뜸 < 남중 < 짐 순서이고, 정오 전에 뜬 달도 뜸 시각이 나온다', () => {
  for (const day of ['2026-11-15', '2026-11-16', '2026-11-20']) {
    for (const b of BODIES) {
      const e = sky.events(b.id, POHANG, kst(day + 'T12:00'));
      assert.ok(e.rise && e.set, `${day} ${b.id}`);
      assert.ok(e.rise < e.transit && e.transit < e.set, `${day} ${b.id}`);
      assert.ok(e.transit >= kst(day + 'T12:00') && e.transit < kst(day + 'T12:00') + 25 * 3600e3);
    }
  }
});
