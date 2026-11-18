// 위젯 설정값(Parameter) 읽기: 「종류 | 좌표 | 이름 | 유리」를 아무 순서로, |·;·쉼표 어느 것으로 나눠도 된다.
// 예) 천체 | 36.17, 128.98 | 보현산   좌표가 없으면 내 위치(here)다 — 실제 좌표는 app.js가 폰에서 읽고, 못 읽으면 포항.
// 좌표 없이 이름만 적으면 내 위치에 그 이름을 붙인다.
import { DEFAULT_PLACE, parseCoords } from '../js/places.js';
import { KINDS, DEFAULT_KIND } from './layout.js';

// 기상만 보여 주는 위젯은 크기마다 이름이 다르다 — 어느 이름을 적어도 그 크기의 것으로
const WEATHER = { small: '날씨', medium: '시간별', large: '기상', extraLarge: '기상' };
const HERE = ['현재', '내위치', '위치', '여기'];
const ALIAS = { 띠: '시간별', 곡선: '고도', 밤하늘: '고도', 출몰: '천체', 행성: '지금', 시상: '대기', '5일밤': '5일' };

/**
 * text: 위젯 설정값(없으면 null), family: small|medium|large|extraLarge|accessory…
 * 반환 {kind, place, glass}. 종류가 없거나 그 크기에 맞지 않으면 그 크기의 기본 위젯. 「유리」가 있으면 glass.
 */
export function parseParam(text, family) {
  // 아주 큰(iPad)은 제 것(전체) 말고 큰 위젯도 받는다 — 판을 가운데 두고 양옆은 바탕
  const size = family, fits = k => KINDS[k] === size || (size === 'extraLarge' && KINDS[k] === 'large');
  let kind = null, coords = null, name = null, glass = false;
  const toks = String(text ?? '').split(/[|;,\n]/).map(t => t.trim()).filter(Boolean);
  for (let i = 0; i < toks.length; i++) {
    const tok = toks[i], bare = tok.replace(/\s/g, '');
    if (bare === '유리') { glass = true; continue; }
    if (HERE.includes(bare)) continue;   // 좌표가 없으면 어차피 내 위치다
    let k = ALIAS[bare] || bare;
    if (Object.values(WEATHER).includes(k) && WEATHER[size]) k = WEATHER[size];
    const pair = i + 1 < toks.length ? parseCoords(tok + ', ' + toks[i + 1]) : null;   // 쉼표로 갈라진 위도, 경도
    if (KINDS[k]) kind = kind || k;
    else if (pair) { coords = coords || pair; i++; }
    else if (parseCoords(tok)) coords = coords || parseCoords(tok);
    else name = name || tok;
  }
  if (DEFAULT_KIND[size] && (!kind || !fits(kind))) kind = DEFAULT_KIND[size];
  const place = coords ? { name: name || '관측지', lat: coords.lat, lon: coords.lon, elev: 0 }
    : { name: name || '내 위치', lat: DEFAULT_PLACE.lat, lon: DEFAULT_PLACE.lon, elev: 0, here: true, custom: !!name };   // 좌표는 app.js가 바꾼다
  return { kind, place, glass };
}

/** 내 위치 좌표를 0.01°(약 1km)로 반올림 — 조금씩 다르게 잡혀도 같은 예보·캐시를 나눠 쓴다 */
export const roundHere = x => Math.round(x * 100) / 100;

/** Scriptable Location.reverseGeocode 결과 하나 → 짧은 지명(읍·면·동 우선). 없으면 null */
export function hereName(g) {
  if (!g) return null;
  const words = [g.subLocality, g.locality, g.subAdministrativeArea, g.administrativeArea]
    .filter(Boolean).flatMap(t => String(t).trim().split(/\s+/)).filter(Boolean);
  return words.find(w => /[동읍면리]$/.test(w)) || words[0] || g.name || null;
}
