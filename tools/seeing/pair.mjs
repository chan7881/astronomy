// 관측(ESO 파라날 MASS-DIMM·기상)과 모형(Open-Meteo 기압면 → model.js)을 시간 단위로 짝짓는다.
// 사용: node pair.mjs <ESO 자료 폴더> <js/model.js> [Open-Meteo 자료 폴더] > pairs.csv   (free_mod는 보정 전 Dewan 값)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [dir, modelPath] = process.argv.slice(2);
const M = await import(pathToFileURL(modelPath).href);
const ELEV = 2635;
const omDir = process.argv[4] ?? dir;
const med = a => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const hourKey = t => { const d = new Date(t + 'Z'); return new Date(Math.round(d / 3.6e6) * 3.6e6).toISOString().slice(0, 13); };

// 여러 달 파일을 한 시간 칸에 모은다. 달 경계의 칸이 두 파일에 걸쳐도 덮어쓰지 않고, 겹친 같은 시각은 한 번만 센다.
function bin(out, seen, file, cols) {   // cols: {이름: 머리글 앞부분}
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#'));
  if (!lines.length) return;
  const head = lines[0].split(',');
  const idx = Object.fromEntries(Object.entries(cols).map(([k, h]) => {
    const i = head.findIndex(x => x.startsWith(h)); if (i < 0) throw new Error(`${file}: ${h} 없음`); return [k, i];
  }));
  for (const l of lines.slice(1)) {
    const c = l.split(','); if (!c[0] || seen.has(c[0])) continue;
    seen.add(c[0]);
    const k = hourKey(c[0]); const o = out[k] ??= Object.fromEntries(Object.keys(cols).map(n => [n, []]));
    for (const [n, i] of Object.entries(idx)) { const v = parseFloat(c[i]); if (Number.isFinite(v)) o[n].push(v); }
  }
}

const obs = {}, met = {}, seenObs = new Set(), seenMet = new Set();
for (const f of fs.readdirSync(dir)) {
  if (f.startsWith('mass_paranal')) bin(obs, seenObs, path.join(dir, f), { free: 'Free Atmosphere Seeing ["]', dimm: 'MASS-DIMM Seeing ["]', gfrac: 'MASS-DIMM Cn2 fraction at ground' });
  if (f.startsWith('meteo_paranal')) bin(met, seenMet, path.join(dir, f), { w10: 'Wind Speed at 10m', w30: 'Wind Speed at 30m' });
}

console.log('hour,n,free_obs,dimm_obs,gfrac,w10_obs,w30_obs,w10_mod,free_mod,jet');
for (const f of fs.readdirSync(omDir).filter(f => f.startsWith('om_')).sort()) {
  const H = JSON.parse(fs.readFileSync(path.join(omDir, f), 'utf8')).hourly; const LEVELS = Object.keys(H).map(k => k.match(/^temperature_(\d+)hPa$/)?.[1]).filter(Boolean).map(Number);
  H.time.forEach((t, i) => {
    const o = obs[t.slice(0, 13)]; if (!o || o.dimm.length < 10) return;
    const levels = LEVELS.map(p => ({ p, T: H[`temperature_${p}hPa`][i], z: H[`geopotential_height_${p}hPa`][i], ws: H[`wind_speed_${p}hPa`][i], wd: H[`wind_direction_${p}hPa`][i] }));
    const w = met[t.slice(0, 13)] ?? { w10: [], w30: [] };
    const row = [t.slice(0, 13), o.dimm.length, med(o.free), med(o.dimm), med(o.gfrac), med(w.w10), med(w.w30), H.wind_speed_10m[i], M.dewanSeeing(levels, ELEV), M.jetSpeed(levels)];
    console.log(row.map(v => typeof v === 'number' ? (Number.isFinite(v) ? +v.toFixed(4) : '') : v ?? '').join(','));
  });
}
