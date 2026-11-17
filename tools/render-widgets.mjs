// 위젯 13종을 폰 화면에 올린 SVG 한 장으로(시안 검토용, 가짜 예보). node tools/render-widgets.mjs <out.svg> [설정값] [이름]
import { readFileSync, writeFileSync } from 'node:fs';
import { makeSky } from '../js/sky.js';
import { normalize, LEVELS } from '../js/api.js';
import { widgetModel } from '../widget/data.js';
import { layout, KINDS } from '../widget/layout.js';
import { parseParam } from '../widget/param.js';
import { toSvg } from '../widget/svg.js';
const mod = { exports: {} };
new Function('module', 'exports', readFileSync(new URL('../vendor/astronomy.browser.min.js', import.meta.url), 'utf8'))(mod, mod.exports);
const [out, p = '', nm] = process.argv.slice(2);
const { place, glass } = parseParam(p, 'small');
if (nm) place.name = nm;
const t0 = Date.parse('2026-11-15T00:00:00Z'), N = 24 * 7;
const time = Array.from({ length: N }, (_, i) => new Date(t0 + i * 3600e3).toISOString().slice(0, 16));
const f = g => time.map((_, i) => g(i));
const cl = i => Math.round(Math.max(0, Math.min(100, 40 + 45 * Math.sin(i / 7))));
const hourly = { time, temperature_2m: f(() => 8), dew_point_2m: f(() => 2), relative_humidity_2m: f(() => 60), cloud_cover: f(cl), cloud_cover_low: f(cl), cloud_cover_mid: f(() => 0), cloud_cover_high: f(() => 0), wind_speed_10m: f(() => 3), wind_direction_10m: f(() => 300), wind_gusts_10m: f(() => 6), precipitation_probability: f(() => 0), visibility: f(() => 20000) };
for (const lv of LEVELS) { const z = 44330 * (1 - (lv / 1013.25) ** 0.1903); hourly[`temperature_${lv}hPa`] = f(() => Math.max(-56.5, 15 - 6.5 * z / 1000)); hourly[`geopotential_height_${lv}hPa`] = f(() => z); hourly[`wind_speed_${lv}hPa`] = f(() => 5 + z / 1000); hourly[`wind_direction_${lv}hPa`] = f(() => 270); }
const data = normalize({ utc_offset_seconds: 32400, elevation: 20, timezone: 'Asia/Seoul', hourly }, { utc_offset_seconds: 32400, hourly: { time, aerosol_optical_depth: f(() => 0.1), pm2_5: f(() => 10), dust: f(() => 1) } });
const m = widgetModel(makeSky(mod.exports), place, data, Date.parse('2026-11-16T21:10:00+09:00'));
const phone = ox => {
  let x = 26, y = 60, rowH = 0; const parts = [];
  for (const k of Object.keys(KINDS)) {
    const L = layout(k, m, { glass });
    if (x + L.w > 390 - 26 + 1) { x = 26; y += rowH + 22; rowH = 0; }
    parts.push(`<g transform="translate(${x},${y})">${toSvg(L, { id: 'w' + k })}</g>`);
    x += L.w + 22; rowH = Math.max(rowH, L.h);
  }
  const H = y + rowH + 40;
  return { H, svg: `<g transform="translate(${ox},0)"><rect width="390" height="${H}" rx="44" fill="url(#wall)"/>${parts.join('')}</g>` };
};
const ps = [phone(10)];
const W = 10 + ps.length * 410, H = Math.max(...ps.map(p => p.H)) + 20;
writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="wall" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#1b2440"/><stop offset="1" stop-color="#05070d"/></linearGradient></defs><rect width="${W}" height="${H}" fill="#000"/><style>text{font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif}</style>${ps.map(p => p.svg).join('')}</svg>`);
