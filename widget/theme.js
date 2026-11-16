// 위젯 색 — FLAT은 style.css의 어두운 테마와 같은 값.
// 유리풍(GLASS)은 같은 색에 반투명 칸(#rrggbbaa)을 쓰고, 바탕은 layout.js가 비스듬한 빛으로 칠한다.
const FLAT = {
  glass: false,
  bg: '#020203', card: '#0a0b0d', band: '#101114', line: '#1e2026', edge: '#2a2d35',
  ink: '#d6d9df', ink2: '#989ea9', ink3: '#727986',
  g: '#4d9a80', m: '#b3964e', b: '#bd6a61',
  cell: { g: '#16362f', m: '#3a331d', b: '#402423', p: '#15181f' }, na: '#0c0d10',
  cloud: '#c2c7d0', cbase: '#13151a',
  tw: ['#262b38', '#1d212c', '#151821', '#0e1016', '#07080b'],
  body: {
    Moon: '#c2c6ce', Mercury: '#9589c4', Venus: '#d6b7a4', Mars: '#c96b61',
    Jupiter: '#c08c5e', Saturn: '#c8b15c', Uranus: '#62b0aa', Neptune: '#6e8ecb',
  },
};
const GLASS = {
  glass: true,
  card: '#0c0d10', band: '#ffffff0d', line: '#ffffff14', edge: '#ffffff26',
  cell: { g: '#4d9a8052', m: '#b3964e4d', b: '#bd6a6152', p: '#ffffff12' }, na: '#ffffff08', cbase: '#ffffff12',
};
export const T = { ...FLAT };
/** 그리기 전에 색을 고른다. glass: 유리풍 */
export function setTheme(glass) { Object.assign(T, FLAT, glass ? GLASS : null); }
