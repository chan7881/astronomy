// Open-Meteo 호출과 정규화. 키 없음 · CORS 허용 · CC BY 4.0
export const LEVELS = [1000, 925, 850, 700, 600, 500, 400, 300, 250, 200, 150, 100];
const SURFACE = ['temperature_2m', 'dew_point_2m', 'relative_humidity_2m', 'cloud_cover', 'cloud_cover_low',
  'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
  'precipitation_probability', 'visibility'];
const LEVEL_VARS = ['temperature', 'geopotential_height', 'wind_speed', 'wind_direction'];
const TTL = 10 * 60e3;   // 화면의 15분 새로 고침보다 짧게

export function forecastUrl(lat, lon) {
  const hourly = [...SURFACE, ...LEVELS.flatMap(p => LEVEL_VARS.map(v => `${v}_${p}hPa`))];
  return 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
    latitude: lat.toFixed(3), longitude: lon.toFixed(3), timezone: 'auto', past_days: 1, forecast_days: 6,
    wind_speed_unit: 'ms', hourly: hourly.join(','),
  });
}

export function airUrl(lat, lon) {
  return 'https://air-quality-api.open-meteo.com/v1/air-quality?' + new URLSearchParams({
    latitude: lat.toFixed(3), longitude: lon.toFixed(3), timezone: 'auto', past_days: 1, forecast_days: 5,
    hourly: 'aerosol_optical_depth,pm2_5,dust',
  });
}

/** 'YYYY-MM-DDTHH:MM'(현지) + UTC 오프셋(초) → epoch ms */
export function localIsoToMs(iso, offsetSec) {
  return Date.parse(iso + ':00Z') - offsetSec * 1000;
}

/** Open-Meteo 응답 → {offsetSec, elev, tz, hours:[{t, cloud, low, mid, high, temp, dew, rh, wind10, windDir, gust, precipProb, vis, levels}]} */
export function normalize(fc, air) {
  const off = fc.utc_offset_seconds, H = fc.hourly;
  const aod = new Map();
  if (air?.hourly) air.hourly.time.forEach((iso, i) => aod.set(localIsoToMs(iso, air.utc_offset_seconds), {
    aod: air.hourly.aerosol_optical_depth?.[i] ?? null, pm25: air.hourly.pm2_5?.[i] ?? null, dust: air.hourly.dust?.[i] ?? null,
  }));
  const hours = H.time.map((iso, i) => {
    const t = localIsoToMs(iso, off);
    return {
      t,
      cloud: H.cloud_cover[i], low: H.cloud_cover_low[i], mid: H.cloud_cover_mid[i], high: H.cloud_cover_high[i],
      temp: H.temperature_2m[i], dew: H.dew_point_2m[i], rh: H.relative_humidity_2m[i],
      wind10: H.wind_speed_10m[i], windDir: H.wind_direction_10m[i], gust: H.wind_gusts_10m[i],
      precipProb: H.precipitation_probability?.[i] ?? null, vis: H.visibility?.[i] ?? null,
      levels: LEVELS.map(p => ({
        p, T: H[`temperature_${p}hPa`]?.[i], z: H[`geopotential_height_${p}hPa`]?.[i],
        ws: H[`wind_speed_${p}hPa`]?.[i], wd: H[`wind_direction_${p}hPa`]?.[i],
      })),
      ...(aod.get(t) || { aod: null, pm25: null, dust: null }),
    };
  }).filter(h => h.temp != null);
  return { offsetSec: off, elev: fc.elevation, tz: fc.timezone, hours };
}

async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/** 예보를 받아 정규화한다. 대기질은 실패해도 계속한다. 10분 캐시. */
export async function loadForecast(lat, lon) {
  const key = `fc:${lat.toFixed(3)},${lon.toFixed(3)}`;
  try {
    const c = JSON.parse(sessionStorage.getItem(key));
    if (c && Date.now() - c.at < TTL) return c.data;
  } catch { /* 캐시 없음 */ }
  const [fc, air] = await Promise.all([getJson(forecastUrl(lat, lon)), getJson(airUrl(lat, lon)).catch(() => null)]);
  const data = normalize(fc, air);
  try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data })); } catch { /* 용량 초과는 무시 */ }
  return data;
}

/** 지명 검색 → [{name, region, lat, lon, elev}] */
export async function searchPlace(q) {
  const j = await getJson('https://geocoding-api.open-meteo.com/v1/search?' + new URLSearchParams({ name: q, language: 'ko', count: 8 }));
  return (j.results || []).map(r => ({
    name: r.name, region: [r.admin2, r.admin1, r.country].filter(Boolean).join(' · '),
    lat: r.latitude, lon: r.longitude, elev: r.elevation ?? 0,
  }));
}
