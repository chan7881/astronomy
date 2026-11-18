import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCoords, locate } from '../js/places.js';
import { osmPlace, mergePlaces } from '../js/api.js';

test('좌표: 글자가 없으면 위도, 경도 순서', () => {
  assert.deepEqual(parseCoords('36.019, 129.343'), { lat: 36.019, lon: 129.343 });
  assert.deepEqual(parseCoords('  36.019 129.343 '), { lat: 36.019, lon: 129.343 });
  assert.deepEqual(parseCoords('36,129'), { lat: 36, lon: 129 });
});

test('좌표: 남반구·서반구는 음수', () => {
  assert.deepEqual(parseCoords('-33.87, 151.21'), { lat: -33.87, lon: 151.21 });
  assert.deepEqual(parseCoords('19.82, -155.47'), { lat: 19.82, lon: -155.47 });
  assert.deepEqual(parseCoords('33.87S 151.21E'), { lat: -33.87, lon: 151.21 });
  assert.deepEqual(parseCoords('19.82°N, 155.47°W'), { lat: 19.82, lon: -155.47 });
  assert.deepEqual(parseCoords('n36.02 e129.34'), { lat: 36.02, lon: 129.34 });
});

test('좌표: 방위 글자가 있으면 경도를 먼저 써도 된다', () => {
  assert.deepEqual(parseCoords('129.34E 36.02N'), { lat: 36.02, lon: 129.34 });
  assert.deepEqual(parseCoords('W155.47, N19.82'), { lat: 19.82, lon: -155.47 });
});

test('좌표: 범위 끝은 받고 넘으면 버린다', () => {
  assert.deepEqual(parseCoords('90, 180'), { lat: 90, lon: 180 });
  assert.deepEqual(parseCoords('-90, -180'), { lat: -90, lon: -180 });
  assert.equal(parseCoords('90.1, 0'), null);
  assert.equal(parseCoords('0, 180.1'), null);
  assert.equal(parseCoords('129.343, 36.019'), null);   // 글자 없이 경도 먼저 — 추측해서 바꾸지 않는다
});

test('좌표가 아닌 것은 null — 지명 검색으로 넘긴다', () => {
  for (const q of ['포항', '', '36.019', '36.0 129.3 20', 'Area 51', '36N 129N', '36E 129W', '36N 129', '-36S 129E', 'N36S 129E', '1e2, 3'])
    assert.equal(parseCoords(q), null, q);
});

// ── 지명(OpenStreetMap 응답 → 관측지) ─────────────────────
const DAEJAM = { lat: '36.0190', lon: '129.3430', name: '포항시청', address: { quarter: '대잠동', suburb: '대이동', borough: '남구', city: '포항시', province: '경상북도', postcode: '37684', country: '대한민국', country_code: 'kr' } };
const CHEONGHA = { lat: '36.2010607', lon: '129.3402788', name: '청하면', address: { town: '청하면', borough: '북구', city: '포항시', province: '경상북도', country: '대한민국' } };

test('지명: 찾은 곳의 이름을 쓰고, 지역은 그 위의 큰 구역 셋과 나라', () => {
  assert.deepEqual(osmPlace(CHEONGHA), { name: '청하면', region: '북구 · 포항시 · 경상북도 · 대한민국', lat: 36.2010607, lon: 129.3402788, elev: 0 });
  assert.deepEqual(osmPlace(DAEJAM), { name: '포항시청', region: '남구 · 포항시 · 경상북도 · 대한민국', lat: 36.019, lon: 129.343, elev: 0 });
});

test('지명: 이름이 없으면(현재 위치) 가장 작은 행정 구역이 이름', () => {
  const p = osmPlace({ ...DAEJAM, name: null });
  assert.equal(p.name, '대잠동');
  assert.equal(p.region, '남구 · 포항시 · 경상북도 · 대한민국');
  const village = osmPlace({ lat: '36.165', lon: '128.976', name: '', address: { village: '갈천리', town: '현서면', county: '청송군', province: '경상북도', country: '대한민국' } });
  assert.deepEqual([village.name, village.region], ['갈천리', '현서면 · 청송군 · 경상북도 · 대한민국']);
});

test('지명: 좌표나 이름이 없는 응답은 버린다', () => {
  assert.equal(osmPlace(null), null);
  assert.equal(osmPlace({ error: 'Unable to geocode' }), null);
  assert.equal(osmPlace({ lat: 'x', lon: '129', name: '가' }), null);
  assert.equal(osmPlace({ lat: null, lon: null, name: '가' }), null);   // Number(null)은 0이다
  assert.equal(osmPlace({ lat: '36', lon: '129', address: { country: '대한민국' } }), null);
  assert.equal(osmPlace({ lat: '0', lon: '0', name: '널섬' }).lat, 0);
});

test('지명: 두 목록을 합칠 때 앞 목록이 먼저, 같은 곳은 한 번만', () => {
  const a = [{ name: '청하면', lat: 36.201, lon: 129.340 }, { name: '청하면', lat: 35.907, lon: 126.840 }];
  const b = [{ name: '청하', lat: 36.21, lon: 129.35 }, { name: 'Cheongha', lat: 41.0, lon: 123.0 }];
  assert.deepEqual(mergePlaces(a, b).map(p => [p.name, p.lat]), [['청하면', 36.201], ['청하면', 35.907], ['Cheongha', 41.0]]);
  // 같은 곳이 두 번 오면 하나만, 해발은 아는 쪽에서 넘겨받는다
  const twice = mergePlaces([{ name: '보현산천문대', lat: 36.164, lon: 128.977, elev: 0 }, { name: '보현산천문대', lat: 36.165, lon: 128.976, elev: 0 }, { name: '보현산', lat: 36.166, lon: 128.975, elev: 0 }], [{ name: '보현산', lat: 36.16, lon: 128.98, elev: 1124 }]);
  assert.deepEqual(twice.map(p => [p.name, p.elev]), [['보현산천문대', 1124], ['보현산', 0]]);
  assert.equal(a[0].elev, undefined);
  assert.deepEqual(mergePlaces([], b).map(p => p.name), ['청하', 'Cheongha']);
  assert.equal(mergePlaces(a, b, 2).length, 2);
  assert.equal(mergePlaces([{ name: 'a', lat: 36, lon: 129 }], [{ name: 'b', lat: 36.04, lon: 129.06 }]).length, 2);   // 위도만 가까우면 다른 곳
});

test('현재 위치: GPS가 안 잡히면 대강의 위치로 한 번 더, 권한이 꺼져 있으면 바로 알린다', async () => {
  const geo = answers => { const calls = []; return { calls, getCurrentPosition(ok, fail, opt) { calls.push(opt); const a = answers[calls.length - 1]; a.code ? fail(a) : ok({ coords: { latitude: a[0], longitude: a[1] } }); } }; };
  const good = geo([[36.02, 129.34]]);
  assert.deepEqual(await locate(good), { lat: 36.02, lon: 129.34 });
  assert.deepEqual([good.calls.length, good.calls[0].enableHighAccuracy, good.calls[0].maximumAge], [1, true, 60000]);
  const indoor = geo([{ code: 3 }, [36.1, 129.3]]);
  assert.deepEqual(await locate(indoor), { lat: 36.1, lon: 129.3 });
  assert.deepEqual(indoor.calls.map(o => o.enableHighAccuracy), [true, false]);
  const denied = geo([{ code: 1 }]);
  await assert.rejects(locate(denied), /위치 권한이 꺼져 있습니다/);
  assert.equal(denied.calls.length, 1);
  await assert.rejects(locate(geo([{ code: 2 }, { code: 3 }])), /위치를 찾지 못했습니다/);
  await assert.rejects(locate(null), /위치 기능 없음/);
});

// ── 예보 받기: 시간 제한 · 지난 예보 대신 보이기 ─────────────────
import { loadForecast, lastForecast, LAST_KEY, LAST_OK } from '../js/api.js';
function fakeStorage() { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m }; }
const okResp = body => ({ ok: true, status: 200, json: async () => body });
const FC = { utc_offset_seconds: 32400, elevation: 20, timezone: 'Asia/Seoul', hourly: { time: ['2026-11-17T00:00'], temperature_2m: [5], dew_point_2m: [1], relative_humidity_2m: [70], cloud_cover: [10], cloud_cover_low: [10], cloud_cover_mid: [0], cloud_cover_high: [0], wind_speed_10m: [2], wind_direction_10m: [0], wind_gusts_10m: [3] } };

test('예보 받기: 서버가 답 없이 멈추면 시간 제한으로 실패한다(무한 대기 없음)', async () => {
  globalThis.sessionStorage = fakeStorage(); globalThis.localStorage = fakeStorage();
  const api = await import('../js/api.js');
  const realFetch = globalThis.fetch;
  let signals = [];
  globalThis.fetch = (url, opt) => { signals.push(opt?.signal); return new Promise((_, rej) => opt?.signal?.addEventListener('abort', () => rej(opt.signal.reason))); };
  const realTimeout = AbortSignal.timeout, asked = [];
  AbortSignal.timeout = ms => {   // 시험은 20ms로 줄여 본다(진짜 타이머는 unref라 시험이 먼저 끝나 버린다)
    asked.push(ms); const c = new AbortController();
    setTimeout(() => c.abort(new DOMException('시간 초과', 'TimeoutError')), 20); return c.signal;
  };
  try {
    await assert.rejects(loadForecast(36.019, 129.343), e => e.name === 'TimeoutError');
    assert.equal(signals.length, 3, '예보 서버 둘 + 대기질');
    assert.ok(signals.every(s => s instanceof AbortSignal), '모든 요청에 시간 제한');
    assert.deepEqual(asked, [api.FETCH_MS, api.AIR_MS, api.FETCH_MS]);
    assert.ok(api.FETCH_MS <= 15e3 && api.FETCH_MS >= 5e3);
    assert.equal(lastForecast(36.019, 129.343), null, '실패한 것은 남기지 않는다');
  } finally { globalThis.fetch = realFetch; AbortSignal.timeout = realTimeout; }
});

test('예보 받기: 첫 서버가 멈추면 다음 서버에서 받고, 그 뒤로는 받은 서버부터 묻는다', async () => {
  globalThis.sessionStorage = fakeStorage(); globalThis.localStorage = fakeStorage();
  const api = await import('../js/api.js');
  const realFetch = globalThis.fetch, urls = [];
  globalThis.fetch = async (url, opt) => {
    url = String(url); urls.push(url);
    if (url.startsWith('https://api.open-meteo.com/')) throw new DOMException('Fetch is aborted', 'AbortError');   // 사파리의 시간 초과
    return okResp(url.includes('air-quality') ? { utc_offset_seconds: 32400, hourly: { time: [] } } : FC);
  };
  try {
    assert.deepEqual(api.FORECAST_HOSTS.slice(0, 2), ['api.open-meteo.com', 'previous-runs-api.open-meteo.com']);
    const d = await loadForecast(36.019, 129.343);
    assert.equal(d.hours.length, 1);
    const fc = urls.filter(u => u.includes('/v1/forecast?'));
    assert.deepEqual(fc.map(u => new URL(u).host), ['api.open-meteo.com', 'previous-runs-api.open-meteo.com']);
    assert.equal(new URL(fc[1]).search, new URL(api.forecastUrl(36.019, 129.343)).search, '같은 변수를 묻는다');
    urls.length = 0; globalThis.sessionStorage = fakeStorage();   // 캐시를 비우고 다시
    await loadForecast(36.019, 129.343);
    assert.deepEqual(urls.filter(u => u.includes('/v1/forecast?')).map(u => new URL(u).host), ['previous-runs-api.open-meteo.com'], '멈춘 서버를 또 기다리지 않는다');
  } finally { globalThis.fetch = realFetch; }
});

test('예보 서버 순서: 넘어간 서버는 한 시간 동안 먼저, 그 뒤엔 첫 서버부터 · 빈 응답은 다음 서버 · 모두 실패하면 첫 서버의 오류', async () => {
  const { hostOrder, fetchFromHosts, HOST_KEEP, FORECAST_HOSTS: H } = await import('../js/api.js');
  const now = 1e12;
  assert.deepEqual(hostOrder(null, now), [0, 1]);
  assert.deepEqual(hostOrder({ i: 1, at: now - 60e3 }, now), [1, 0]);
  assert.deepEqual(hostOrder({ i: 1, at: now - HOST_KEEP }, now), [0, 1], '한 시간 지남');
  assert.deepEqual(hostOrder({ i: 1, at: now + 60e3 }, now), [0, 1], '앞날 시각(시계 틀림)');
  for (const bad of [{ i: 5, at: now }, { i: '1', at: now }, { i: 0, at: now }, {}]) assert.deepEqual(hostOrder(bad, now), [0, 1], JSON.stringify(bad));
  const good = { hourly: { time: [] } };
  // 첫 서버가 빈 응답(200인데 hourly 없음)이면 다음 서버에서 받고 넘어간 때를 기억한다
  let r = await fetchFromHosts(async h => (h === H[0] ? { error: true } : good), null, now);
  assert.ok(r.fc === good && r.i === 1); assert.deepEqual(r.saved, { i: 1, at: now });
  // 기억한 서버에서 받으면 기억을 그대로 둔다(넘어간 때를 늦추지 않는다)
  const saved = { i: 1, at: now - 60e3 };
  r = await fetchFromHosts(async () => good, saved, now);
  assert.ok(r.i === 1 && r.saved === saved);
  // 기억한 서버가 실패해 첫 서버에서 받으면 기억을 지운다
  r = await fetchFromHosts(async h => { if (h === H[1]) throw new Error('x'); return good; }, saved, now);
  assert.ok(r.i === 0 && r.saved === null);
  // 모두 실패: 묻는 순서와 상관없이 첫 서버의 오류
  const fail = async h => { throw new Error(h); };
  await assert.rejects(fetchFromHosts(fail, saved, now), { message: H[0] });
  await assert.rejects(fetchFromHosts(fail, null, now), { message: H[0] });
});

test('예보 받기: 받은 예보를 남기고, 같은 관측지·하루 안이면 대신 보인다', async () => {
  globalThis.sessionStorage = fakeStorage(); globalThis.localStorage = fakeStorage();
  const realFetch = globalThis.fetch;
  globalThis.fetch = async url => okResp(url.includes('air-quality') ? { utc_offset_seconds: 32400, hourly: { time: [] } } : FC);
  try {
    await loadForecast(36.019, 129.343);
    const now = Date.now();
    const last = lastForecast(36.019, 129.343, now);
    assert.ok(last && last.data.hours.length === 1 && now - last.at < 5000);
    assert.equal(lastForecast(36.2, 129.343, now), null, '다른 관측지');
    assert.equal(lastForecast(36.019, 129.343, now + LAST_OK + 1), null, '하루 지남');
    globalThis.localStorage.setItem(LAST_KEY, '{망가짐');
    assert.equal(lastForecast(36.019, 129.343, now), null, '망가진 저장본');
  } finally { globalThis.fetch = realFetch; }
});
