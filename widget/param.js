// 위젯 설정값(Parameter) 읽기: 「종류 | 좌표 | 이름」을 아무 순서로, |·;·쉼표 어느 것으로 나눠도 된다.
// 예) 천체 | 36.17, 128.98 | 보현산   이름만 적고 좌표가 없으면 관측지는 포항 그대로다(위젯 머리에 포항이라고 나온다).
import { DEFAULT_PLACE, parseCoords } from '../js/places.js';
import { KINDS, DEFAULT_KIND } from './layout.js';

const ALIAS = { 기상: '시간별', 띠: '시간별', 곡선: '고도', 밤하늘: '고도', 출몰: '천체', 행성: '지금', 시상: '대기', '5일밤': '5일' };

/**
 * text: 위젯 설정값(없으면 null), family: small|medium|large|extraLarge|accessory…
 * 반환 {kind, place}. 종류가 없거나 그 크기에 맞지 않으면 그 크기의 기본 위젯.
 */
export function parseParam(text, family) {
  const size = family === 'extraLarge' ? 'large' : family;
  let kind = null, coords = null, name = null;
  const toks = String(text ?? '').split(/[|;,\n]/).map(t => t.trim()).filter(Boolean);
  for (let i = 0; i < toks.length; i++) {
    const tok = toks[i], k = ALIAS[tok.replace(/\s/g, '')] || tok.replace(/\s/g, '');
    const pair = i + 1 < toks.length ? parseCoords(tok + ', ' + toks[i + 1]) : null;   // 쉼표로 갈라진 위도, 경도
    if (KINDS[k]) kind = kind || k;
    else if (pair) { coords = coords || pair; i++; }
    else if (parseCoords(tok)) coords = coords || parseCoords(tok);
    else name = name || tok;
  }
  if (DEFAULT_KIND[size] && (!kind || KINDS[kind] !== size)) kind = DEFAULT_KIND[size];
  const place = coords ? { name: name || '관측지', lat: coords.lat, lon: coords.lon, elev: 0 } : { ...DEFAULT_PLACE };
  return { kind, place };
}
