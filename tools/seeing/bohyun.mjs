// 보현산천문대 SLODAR 관측(2014-06부터 약 1년, 약 30밤 · r0 = 8.28 ± 2.25cm @500nm)과 사이트 시상식의 기후값을 견준다.
// 그때의 기압면 예보는 Open-Meteo에 없어(과거 예보는 2022년부터), 최근 1년을 같은 조건(천문박명 · 구름 ≤ 20% · 습도 < 70%)으로 고른다.
// 사용: node bohyun.mjs <저장 폴더> [시작 YYYY-MM-DD] [끝 YYYY-MM-DD]
import fs from 'node:fs';
import path from 'node:path';
import * as M from '../../js/model.js';
import { LEVELS } from '../../js/api.js';

const [OUT, START = '2024-06-01', END = '2025-05-31'] = process.argv.slice(2);
const LAT = 36.1648, LON = 128.9766;          // 보현산천문대 (논문 좌표 36°09'53"N 128°58'36"E)
const SLODAR_R0 = 8.28;                       // cm, 500nm, 전체 밤의 평균 (Lee 외 2015, AMOS)
fs.mkdirSync(OUT, { recursive: true });

// 시상(″) ↔ r0(cm, 500nm): ε = 0.98 λ / r0
const R = 0.98 * 500e-9 * 206264.8 * 100;     // ″·cm
const toR0 = s => R / s, toSee = r0 => R / r0;

const mod = { exports: {} };
new Function('module', 'exports', fs.readFileSync(new URL('../../vendor/astronomy.browser.min.js', import.meta.url), 'utf8'))(mod, mod.exports);
const A = mod.exports, obs = new A.Observer(LAT, LON, 1124);
const sunAlt = t => { const eq = A.Equator('Sun', t, obs, true, true); return A.Horizon(t, obs, eq.ra, eq.dec).altitude; };

const vars = ['wind_speed_10m', 'cloud_cover', 'relative_humidity_2m',
  ...LEVELS.flatMap(p => ['temperature', 'geopotential_height', 'wind_speed', 'wind_direction'].map(v => `${v}_${p}hPa`))];

async function get(a, b) {
  const file = path.join(OUT, `bohyun_${a}_${b}.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const q = new URLSearchParams({ latitude: LAT, longitude: LON, start_date: a, end_date: b, hourly: vars.join(','), wind_speed_unit: 'ms', timezone: 'UTC' });
  const r = await fetch(`https://historical-forecast-api.open-meteo.com/v1/forecast?${q}`);
  const j = await r.json();
  if (!j.hourly) throw new Error(`${a}..${b}: ${JSON.stringify(j).slice(0, 200)}`);
  fs.writeFileSync(file, JSON.stringify(j));     // 받은 뒤에 쓴다
  return j;
}

// 석 달씩 나눠 받는다
const rows = [];
for (let d = new Date(START + 'T00:00Z'); d <= new Date(END + 'T00:00Z');) {
  const e = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 3, 0));
  const end = e > new Date(END + 'T00:00Z') ? new Date(END + 'T00:00Z') : e;
  const j = await get(d.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
  const H = j.hourly;
  H.time.forEach((t, i) => {
    const time = new Date(t + 'Z');
    if (sunAlt(time) > -18) return;
    const levels = LEVELS.map(p => ({ p, T: H[`temperature_${p}hPa`][i], z: H[`geopotential_height_${p}hPa`][i], ws: H[`wind_speed_${p}hPa`][i], wd: H[`wind_direction_${p}hPa`][i] }));
    const free = M.freeSeeing(levels, j.elevation);
    if (free == null || H.wind_speed_10m[i] == null) return;
    // 밤 이름: 한국 시각으로 정오 이전이면 전날 밤
    const night = new Date(time.getTime() + 9 * 3.6e6 - 12 * 3.6e6).toISOString().slice(0, 10);
    rows.push({ night, free, wind: H.wind_speed_10m[i], cloud: H.cloud_cover[i], rh: H.relative_humidity_2m[i] });
  });
  d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
}

const total = (r, c0) => Math.pow(Math.pow(r.free, 5 / 3) + Math.pow(c0 + 0.06 * Math.max(0, r.wind), 5 / 3), 3 / 5);
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const med = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const C0 = M.groundSeeing(0);                   // 사이트의 지표층 상수

function report(label, sel) {
  const tot = sel.map(r => total(r, C0));
  const r0 = tot.map(toR0);
  console.log(`\n[${label}] ${sel.length}시간 · ${new Set(sel.map(r => r.night)).size}밤`);
  console.log(`  자유대기 중앙 ${med(sel.map(r => r.free)).toFixed(2)}″ · 지표층 중앙 ${med(sel.map(r => C0 + 0.06 * r.wind)).toFixed(2)}″ · 지상풍 중앙 ${med(sel.map(r => r.wind)).toFixed(1)}m/s`);
  console.log(`  전체 시상 중앙 ${med(tot).toFixed(2)}″ · r0 평균 ${mean(r0).toFixed(2)}cm(= ${toSee(mean(r0)).toFixed(2)}″) · r0 표준편차 ${Math.sqrt(mean(r0.map(x => (x - mean(r0)) ** 2))).toFixed(2)}cm`);
  // SLODAR 평균 r0에 맞추려면 지표층 상수가 얼마여야 하나 (이분법)
  let lo = 0, hi = 3;
  for (let k = 0; k < 50; k++) { const c = (lo + hi) / 2; mean(sel.map(r => toR0(total(r, c)))) > SLODAR_R0 ? lo = c : hi = c; }
  const byMonth = {};
  sel.forEach(r => (byMonth[r.night.slice(0, 7)] ??= []).push(r));
  console.log('  달별: ' + Object.entries(byMonth).map(([m, a]) => `${m.slice(5)}월 ${a.length}h 자유 ${med(a.map(r => r.free)).toFixed(2)} 전체 ${med(a.map(r => total(r, C0))).toFixed(2)}`).join(' · '));
  console.log(`  SLODAR r0 ${SLODAR_R0}cm(= ${toSee(SLODAR_R0).toFixed(2)}″)에 맞는 지표층 상수: ${((lo + hi) / 2).toFixed(2)}″ (지금 ${C0}″)`);
}

// 사이트 식과 이 스크립트의 합산이 같은지 먼저 확인
const chk = rows.find(r => r.wind > 1);
if (chk && Math.abs(total(chk, C0) - Math.pow(Math.pow(chk.free, 5 / 3) + Math.pow(M.groundSeeing(chk.wind), 5 / 3), 3 / 5)) > 1e-9) throw new Error('합산식이 사이트와 다름');

report('천문박명 사이 전체', rows);
report('SLODAR가 돌던 조건: 구름 ≤ 20% · 습도 < 70%', rows.filter(r => r.cloud <= 20 && r.rh < 70));
