// Open-Meteo 호출과 정규화. 키 없음 · CORS 허용 · CC BY 4.0
export const LEVELS = [1000, 925, 850, 700, 600, 500, 400, 300, 250, 200, 150, 100];
const SURFACE = ['temperature_2m', 'dew_point_2m', 'relative_humidity_2m', 'cloud_cover', 'cloud_cover_low',
  'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
  'precipitation_probability', 'visibility'];
const LEVEL_VARS = ['temperature', 'geopotential_height', 'wind_speed', 'wind_direction'];
const TTL = 10 * 60e3;   // 화면의 15분 새로 고침보다 짧게

// 예보 서버. 앞의 것이 멈추면 뒤의 것으로 받는다 — 2026-11 api.open-meteo.com의 한 서버(51.81.167.44, 한국이 이리로 간다)가
// 새 연결을 받지 않아 「예보를 불러오지 못했습니다」가 잦았다(open-meteo GitHub 11-13 보고). previous-runs-api는 다른 서버이고
// 이 주소(/v1/forecast)에 같은 변수·같은 최신 예보를 돌려준다(11-18 확인: 7일 168시각, 61변수 모두 값).
export const FORECAST_HOSTS = ['api.open-meteo.com', 'previous-runs-api.open-meteo.com'];

export function forecastUrl(lat, lon, host = FORECAST_HOSTS[0]) {
  const hourly = [...SURFACE, ...LEVELS.flatMap(p => LEVEL_VARS.map(v => `${v}_${p}hPa`))];
  return `https://${host}/v1/forecast?` + new URLSearchParams({
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

/** ms: 이 시간 안에 답이 없으면 그만둔다(없으면 기다린다) */
async function getJson(url, ms) {
  const r = await fetch(url, ms ? { signal: AbortSignal.timeout(ms) } : undefined);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// 서버가 답 없이 멈추면(2026-11-17 api.open-meteo.com 장애) 화면이 「불러오는 중」에 머문다 — 시간 제한을 둔다.
// 서버마다 FETCH_MS씩 기다리고 다음 서버로 넘어간다(정상 응답은 2초 안팎).
export const FETCH_MS = 10e3, AIR_MS = 10e3;
// 첫 서버가 멈춰 다른 서버에서 받았으면 한동안 그 서버부터 묻는다(앱을 열 때마다 멈춘 서버를 10초씩 기다리지 않게).
// 넘어간 지 HOST_KEEP이 지나면 첫 서버가 돌아왔는지 다시 본다.
export const HOST_KEY = 'fc-host', HOST_KEEP = 3600e3;

/** 물을 서버 순서(FORECAST_HOSTS의 번호). saved = {i, at}: 첫 서버가 실패해 i번 서버로 넘어간 때 */
export function hostOrder(saved, now = Date.now()) {
  const n = FORECAST_HOSTS.length;
  const i = saved && Number.isInteger(saved.i) && saved.i > 0 && saved.i < n && now - saved.at >= 0 && now - saved.at < HOST_KEEP ? saved.i : 0;
  return FORECAST_HOSTS.map((_, k) => (i + k) % n);
}

/**
 * 서버를 hostOrder 순서로 물어(fetchOne(host)) 처음 받은 예보 {fc, i, saved}를 돌려준다. saved는 다음에 기억할 값
 * (첫 서버가 실패하고 다른 서버에서 받았으면 새 {i, at}, 첫 서버에서 받았으면 null, 그 밖에는 그대로).
 * 모두 실패하면 첫 서버의 오류를 던진다(오류 문구가 묻는 순서에 따라 바뀌지 않게). 본판과 위젯이 함께 쓴다.
 */
export async function fetchFromHosts(fetchOne, saved, now = Date.now()) {
  const errs = [];
  for (const i of hostOrder(saved, now)) {
    try {
      const fc = await fetchOne(FORECAST_HOSTS[i]);
      if (!fc || !fc.hourly || !Array.isArray(fc.hourly.time)) throw new Error('예보 응답이 비었다');
      return { fc, i, saved: i === 0 ? null : errs[0] ? { i, at: now } : saved };
    } catch (e) { errs[i] = e; }
  }
  throw errs[0];
}

async function getForecast(lat, lon) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(HOST_KEY)); } catch { /* 없음 */ }
  const r = await fetchFromHosts(host => getJson(forecastUrl(lat, lon, host), FETCH_MS), saved);
  try { if (r.saved !== saved) localStorage.setItem(HOST_KEY, JSON.stringify(r.saved)); } catch { /* 저장 불가 환경 */ }
  return r.fc;
}
// 마지막으로 받은 예보(한 곳)를 남겨 두고, 받기에 실패하면 이만큼 지난 것까지 대신 보인다
export const LAST_KEY = 'fc-last', LAST_OK = 24 * 3600e3;
const coordKey = (lat, lon) => `${lat.toFixed(3)},${lon.toFixed(3)}`;

/** 예보를 받아 정규화한다. 대기질은 실패해도 계속한다. 10분 캐시. */
export async function loadForecast(lat, lon) {
  const key = `fc:${coordKey(lat, lon)}`;
  try {
    const c = JSON.parse(sessionStorage.getItem(key));
    if (c && Date.now() - c.at < TTL) return c.data;
  } catch { /* 캐시 없음 */ }
  const [fc, air] = await Promise.all([getForecast(lat, lon), getJson(airUrl(lat, lon), AIR_MS).catch(() => null)]);
  const data = normalize(fc, air), at = Date.now();
  const json = JSON.stringify(data);
  try { sessionStorage.setItem(key, `{"at":${at},"data":${json}}`); } catch { /* 용량 초과는 무시 */ }
  try { localStorage.setItem(LAST_KEY, `{"key":"${coordKey(lat, lon)}","at":${at},"data":${json}}`); } catch { /* 저장 불가 환경 */ }
  return data;
}

/** 받기에 실패했을 때 대신 보일 예보: 같은 관측지에서 LAST_OK 안에 받은 것 {at, data}, 없으면 null */
export function lastForecast(lat, lon, now = Date.now()) {
  try {
    const c = JSON.parse(localStorage.getItem(LAST_KEY));
    return c && c.key === coordKey(lat, lon) && now - c.at < LAST_OK && c.data?.hours?.length ? { at: c.at, data: c.data } : null;
  } catch { return null; }
}

// ── 지명 ───────────────────────────────────────────────
// 읍·면·동과 천문대 같은 곳은 OpenStreetMap(Nominatim)이, 세계 도시와 해발은 Open-Meteo가 잘 안다. 둘을 함께 쓴다.
const OSM = 'https://nominatim.openstreetmap.org/';
const UNITS = ['neighbourhood', 'quarter', 'hamlet', 'village', 'suburb', 'town', 'city_district', 'borough', 'district',
  'municipality', 'city', 'county', 'state_district', 'province', 'state', 'region'];   // 작은 것부터

/**
 * Nominatim 결과 하나 → {name, region, lat, lon, elev}. 좌표가 없으면 null.
 * 이름은 찾은 곳의 이름(없으면 가장 작은 행정 구역), region은 그 위의 큰 구역 셋 + 나라.
 */
export function osmPlace(r) {
  const lat = Number(r?.lat), lon = Number(r?.lon);
  if (!r || r.lat == null || r.lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const ad = r.address || {}, units = UNITS.map(k => ad[k]).filter(Boolean);
  const name = r.name || units[0];
  if (!name) return null;
  const upper = units.filter(u => u !== name).slice(-3);
  return { name, region: [...upper, ad.country].filter(Boolean).join(' · '), lat, lon, elev: 0 };
}

/**
 * 두 목록을 합친다. 앞 목록이 먼저, 뒤 목록에서는 이미 있는 곳(약 5km 안)을 빼되 해발은 넘겨받는다.
 * 앞 목록 안에서 이름이 같고 자리도 같은 것은 하나만 남긴다.
 */
export function mergePlaces(first, second, max = 10) {
  const near = (o, p) => Math.abs(o.lat - p.lat) < 0.05 && Math.abs(o.lon - p.lon) < 0.05;
  const out = [];
  for (const p of first) if (!out.some(o => o.name === p.name && near(o, p))) out.push({ ...p });
  for (const p of second) {
    const o = out.find(x => near(x, p));
    if (!o) out.push({ ...p }); else if (!o.elev && p.elev) o.elev = p.elev;
  }
  return out.slice(0, max);
}

/** 지명 검색 → [{name, region, lat, lon, elev}]. 두 곳 모두 실패하면 던진다. */
export async function searchPlace(q) {
  const [osm, om] = await Promise.allSettled([
    getJson(OSM + 'search?' + new URLSearchParams({ q, format: 'jsonv2', addressdetails: 1, limit: 8, 'accept-language': 'ko' }), 6000),
    getJson('https://geocoding-api.open-meteo.com/v1/search?' + new URLSearchParams({ name: q, language: 'ko', count: 8 }), 6000),
  ]);
  if (osm.status === 'rejected' && om.status === 'rejected') throw osm.reason;
  const a = osm.status === 'fulfilled' && Array.isArray(osm.value) ? osm.value.map(osmPlace).filter(Boolean) : [];
  const b = om.status === 'fulfilled' ? (om.value.results || []).map(r => ({
    name: r.name, region: [r.admin2, r.admin1, r.country].filter(Boolean).join(' · '),
    lat: r.latitude, lon: r.longitude, elev: r.elevation ?? 0,
  })) : [];
  return mergePlaces(a, b);
}

/** 좌표 → 그곳의 읍·면·동 이름과 지역. 좌표는 받은 그대로 두고, 밖으로는 약 100m로 뭉뚱그려 보낸다. 못 찾으면 null */
export async function reversePlace(lat, lon) {
  const r = await getJson(OSM + 'reverse?' + new URLSearchParams({ lat: lat.toFixed(3), lon: lon.toFixed(3), format: 'jsonv2', addressdetails: 1, zoom: 14, 'accept-language': 'ko' }), 5000);
  const p = osmPlace({ ...r, name: null });          // 건물·길 이름이 아니라 행정 구역 이름을 쓴다
  return p && { ...p, lat, lon };
}
