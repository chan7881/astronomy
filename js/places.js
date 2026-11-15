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

export const coordText = p => `${Math.abs(p.lat).toFixed(2)}°${p.lat >= 0 ? 'N' : 'S'} ${Math.abs(p.lon).toFixed(2)}°${p.lon >= 0 ? 'E' : 'W'}`;
