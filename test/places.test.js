import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCoords } from '../js/places.js';

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
