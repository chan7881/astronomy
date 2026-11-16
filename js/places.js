// 관측지·즐겨찾기·테마 저장(localStorage)
export const DEFAULT_PLACE = { name: '포항', region: '경상북도 · 대한민국', lat: 36.019, lon: 129.343, elev: 20 };

const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 저장 불가 환경 */ } };

export const samePlace = (a, b) => Math.abs(a.lat - b.lat) < 0.005 && Math.abs(a.lon - b.lon) < 0.005;

export const loadPlace = () => get('place', DEFAULT_PLACE);
export const savePlace = p => set('place', p);
export const loadFavorites = () => get('favorites', [DEFAULT_PLACE]);
export const isFavorite = p => loadFavorites().some(f => samePlace(f, p));
export function toggleFavorite(p) {
  const list = loadFavorites();
  const next = list.some(f => samePlace(f, p)) ? list.filter(f => !samePlace(f, p)) : [...list, p];
  set('favorites', next);
  return next;
}
export const loadTheme = () => get('theme', 'dark');
export const saveTheme = t => set('theme', t);

/** 현재 위치 → {lat, lon} */
export function locate() {
  return new Promise((res, rej) => {
    if (!navigator.geolocation) return rej(new Error('위치 기능 없음'));
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: p.coords.latitude, lon: p.coords.longitude }),
      e => rej(new Error(e.code === 1 ? '위치 권한이 꺼져 있습니다' : '위치를 찾지 못했습니다')),
      { timeout: 10000, maximumAge: 600000 });
  });
}

/**
 * '36.02, 129.34' · '36.02N 129.34E' · 'E129.34 N36.02' → {lat, lon}. 좌표가 아니면 null.
 * 방위 글자가 없으면 위도, 경도 순서로 읽는다.
 */
export function parseCoords(q) {
  const m = String(q).trim().toUpperCase().replace(/°/g, '')
    .match(/^([NSEW])?\s*([+-]?\d+(?:\.\d+)?)\s*([NSEW])?\s*[,\s]\s*([NSEW])?\s*([+-]?\d+(?:\.\d+)?)\s*([NSEW])?$/);
  if (!m) return null;
  if ((m[1] && m[3]) || (m[4] && m[6])) return null;
  const part = (letter, num) => ({ letter: letter || '', v: +num, signed: /^[+-]/.test(num) });
  let a = part(m[1] || m[3], m[2]), b = part(m[4] || m[6], m[5]);
  if (!a.letter !== !b.letter) return null;                     // 한쪽만 방위 글자
  if (a.letter) {
    if (a.signed || b.signed) return null;                      // 글자와 부호를 함께 쓰지 않는다
    const isLat = x => x.letter === 'N' || x.letter === 'S';
    if (isLat(a) === isLat(b)) return null;
    if (!isLat(a)) [a, b] = [b, a];
    if (a.letter === 'S') a.v = -a.v;
    if (b.letter === 'W') b.v = -b.v;
  }
  if (Math.abs(a.v) > 90 || Math.abs(b.v) > 180) return null;
  return { lat: a.v, lon: b.v };
}

export const coordText =p => `${Math.abs(p.lat).toFixed(2)}°${p.lat >= 0 ? 'N' : 'S'} ${Math.abs(p.lon).toFixed(2)}°${p.lon >= 0 ? 'E' : 'W'}`;
