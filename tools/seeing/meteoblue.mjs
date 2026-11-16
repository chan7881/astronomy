// meteoblue식 재료(불량층·리처드슨 수·200hPa 제트)를 파라날 관측과 짝지어 뽑는다.
// 사용: node meteoblue.mjs <ESO 자료 폴더> <js/model.js> <Open-Meteo 자료 폴더> > feat.csv   (fetch.py로 받은 폴더)
// free_site·ri_site는 사이트의 freeSeeing·richardsonIndex 그대로
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [dir, modelPath, omDir] = process.argv.slice(2);
const M = await import(pathToFileURL(modelPath).href);
const ELEV = 2635, G = 9.81;
const med = a => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const hourKey = t => { const d = new Date(t + 'Z'); return new Date(Math.round(d / 3.6e6) * 3.6e6).toISOString().slice(0, 13); };
function bin(out, seen, file, cols) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#'));
  if (!lines.length) return;
  const head = lines[0].split(',');
  const idx = Object.fromEntries(Object.entries(cols).map(([k, h]) => [k, head.findIndex(x => x.startsWith(h))]));
  for (const l of lines.slice(1)) {
    const c = l.split(','); if (!c[0] || seen.has(c[0])) continue; seen.add(c[0]);
    const o = out[hourKey(c[0])] ??= Object.fromEntries(Object.keys(cols).map(n => [n, []]));
    for (const [n, i] of Object.entries(idx)) { const v = parseFloat(c[i]); if (Number.isFinite(v)) o[n].push(v); }
  }
}
const obs = {}, seen = new Set();
for (const f of fs.readdirSync(dir)) if (f.startsWith('mass_paranal'))
  bin(obs, seen, path.join(dir, f), { free: 'Free Atmosphere Seeing ["]', dimm: 'MASS-DIMM Seeing ["]' });

// meteoblue(Meteosurf 2004) 기준: dθ/dz ≥ 0.5K/100m 연속 구간이면서 위아래 온위 차 ≥ 2K
function mbBad(ls, topHpa) {
  const runs = []; let run = null;
  for (const l of ls.filter(l => l.pMid >= topHpa)) {
    if (l.grad >= 0.5) { run ??= { dth: 0, dz: 0, gmax: 0 }; run.dth += l.grad * l.dz / 100; run.dz += l.dz; run.gmax = Math.max(run.gmax, l.grad); }
    else if (run) { runs.push(run); run = null; }
  }
  if (run) runs.push(run);
  const ok = runs.filter(r => r.dth >= 2);
  return { n: ok.length, dth: ok.reduce((s, r) => s + r.dth, 0), dz: ok.reduce((s, r) => s + r.dz, 0), nAny: runs.length, dthAny: runs.reduce((s, r) => s + r.dth, 0) };
}
// 리처드슨 수 Ri = (g/T)(dθ/dz)/(du/dz)² ≤ 0.25 인 층
function cat(ls, topHpa) {
  let n = 0, dz = 0, riMin = Infinity, inv = 0, capA = 0, capB = 0;
  for (const l of ls.filter(l => l.pMid >= topHpa)) {
    const N2 = G / l.thMid * l.grad / 100, S2 = l.shear * l.shear;
    const ri = S2 > 0 ? N2 / S2 : Infinity;
    riMin = Math.min(riMin, ri);
    if (ri <= 0.25) { n++; dz += l.dz; }
    if (N2 > 0 && S2 > 0) inv += l.dz * S2 / N2 * 1e-3;   // 연속 지표: 1/Ri를 두께로 적분
    if (N2 > 0) capA += l.dz * Math.min(S2 / N2, 4) * 1e-3;
    capB += l.dz * (N2 > 0 ? Math.min(S2 / N2, 4) : 4) * 1e-3;
  }
  return { n, dz, riMin: Number.isFinite(riMin) ? riMin : 99, inv, capA, capB };
}
console.log('hour,free_obs,dimm_obs,dewan,jet,ws200,bad_n,bad_dth,bad_dz,bad_nany,bad_dthany,bad_n100,cat_n,cat_dz,ri_min,ri_inv,cat_n100,cap_a,cap_b,free_site,ri_site');
for (const f of fs.readdirSync(omDir).filter(f => f.startsWith('om_')).sort()) {
  const H = JSON.parse(fs.readFileSync(path.join(omDir, f), 'utf8')).hourly;
  const LV = Object.keys(H).map(k => k.match(/^temperature_(\d+)hPa$/)?.[1]).filter(Boolean).map(Number);
  H.time.forEach((t, i) => {
    const o = obs[t.slice(0, 13)]; if (!o || o.dimm.length < 10) return;
    const levels = LV.map(p => ({ p, T: H[`temperature_${p}hPa`][i], z: H[`geopotential_height_${p}hPa`][i], ws: H[`wind_speed_${p}hPa`][i], wd: H[`wind_direction_${p}hPa`][i] }));
    const ls = M.layers(levels, ELEV);
    const b = mbBad(ls, 200), b1 = mbBad(ls, 100), c = cat(ls, 200), c1 = cat(ls, 100);
    const ws200 = levels.find(l => l.p === 200)?.ws;
    const row = [t.slice(0, 13), med(o.free), med(o.dimm), M.dewanSeeing(levels, ELEV), M.jetSpeed(levels), ws200,
      b.n, b.dth, b.dz, b.nAny, b.dthAny, b1.n, c.n, c.dz, c.riMin, c.inv, c1.n, c.capA, c.capB, M.freeSeeing(levels, ELEV), M.richardsonIndex(levels, ELEV)];
    console.log(row.map(v => typeof v === 'number' ? (Number.isFinite(v) ? +v.toFixed(4) : '') : v ?? '').join(','));
  });
}

