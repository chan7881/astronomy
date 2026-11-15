// astronomy-engine 래퍼. 라이브러리 객체를 주입받는다(브라우저: window.Astronomy, 테스트: require).
import { angularDiameter, moonPhaseName } from './model.js';

export const BODIES = [
  { id: 'Moon', ko: '달', r: 1737.4 },
  { id: 'Mercury', ko: '수성', r: 2439.7 },
  { id: 'Venus', ko: '금성', r: 6051.8 },
  { id: 'Mars', ko: '화성', r: 3396.2 },
  { id: 'Jupiter', ko: '목성', r: 71492 },
  { id: 'Saturn', ko: '토성', r: 60268 },
  { id: 'Uranus', ko: '천왕성', r: 25559, outer: true },
  { id: 'Neptune', ko: '해왕성', r: 24764, outer: true },
];

const CONST_KO = {
  Ari: '양', Tau: '황소', Gem: '쌍둥이', Cnc: '게', Leo: '사자', Vir: '처녀', Lib: '천칭', Sco: '전갈', Oph: '뱀주인',
  Sgr: '궁수', Cap: '염소', Aqr: '물병', Psc: '물고기', Cet: '고래', Ori: '오리온', Sex: '육분의', Aur: '마차부',
  Crv: '까마귀', Sct: '방패', Peg: '페가수스', Hya: '바다뱀', Crt: '컵', LMi: '작은사자',
};

export function makeSky(A) {
  const obs = p => new A.Observer(p.lat, p.lon, p.elev || 0);
  const ms = t => (t ? t.date.getTime() : null);

  /** 그날 밤의 해·박명 시각(ms). noon: 그날 현지 정오(Date|ms) */
  function night(place, noon) {
    const o = obs(place), start = new Date(noon);
    const sunset = A.SearchRiseSet('Sun', o, -1, start, 1);
    const from = sunset ? sunset.date : start;
    const alt = (dir, t0, deg) => ms(A.SearchAltitude('Sun', o, dir, t0, 1, deg));
    return {
      sunset: ms(sunset),
      sunrise: ms(A.SearchRiseSet('Sun', o, +1, from, 1)),
      civilEnd: alt(-1, start, -6), nautEnd: alt(-1, start, -12), astroEnd: alt(-1, start, -18),
      astroStart: alt(+1, from, -18), nautStart: alt(+1, from, -12), civilStart: alt(+1, from, -6),
    };
  }

  /** 고도·방위(°), 대기 굴절 포함 */
  function altAz(body, place, t) {
    const o = obs(place), d = new Date(t);
    const eq = A.Equator(body, d, o, true, true);
    const h = A.Horizon(d, o, eq.ra, eq.dec, 'normal');
    return { alt: h.altitude, az: h.azimuth };
  }

  /** t0~t1 사이 고도 자취 [{t, alt, az}] */
  function track(body, place, t0, t1, stepMin = 10) {
    const out = [], step = stepMin * 60e3;
    for (let t = t0; t <= t1 + 1; t += step) out.push({ t, ...altAz(body, place, t) });
    return out;
  }

  /** 정오 뒤 첫 남중과, 그 남중을 사이에 둔 뜸(앞)·짐(뒤) */
  function events(body, place, noon) {
    const o = obs(place);
    const tr = A.SearchHourAngle(body, o, 0, new Date(noon));
    return {
      rise: ms(A.SearchRiseSet(body, o, +1, tr.time, -1)),
      set: ms(A.SearchRiseSet(body, o, -1, tr.time, 1)),
      transit: ms(tr.time), transitAlt: tr.hor.altitude,
    };
  }

  /** 밝기·크기 제원 */
  function facts(body, place, t) {
    const d = new Date(t), def = BODIES.find(b => b.id === body);
    const il = A.Illumination(body, d);
    const j = A.Equator(body, d, obs(place), false, true);
    const c = A.Constellation(j.ra, j.dec);
    return {
      mag: il.mag, frac: il.phase_fraction, distAu: il.geo_dist,
      diam: angularDiameter(def.r, il.geo_dist),
      ra: j.ra, dec: j.dec,
      constellation: CONST_KO[c.symbol] ? CONST_KO[c.symbol] + '자리' : c.name,
    };
  }

  function moon(t) {
    const d = new Date(t), deg = A.MoonPhase(d);
    return { deg, name: moonPhaseName(deg), frac: A.Illumination('Moon', d).phase_fraction, age: deg / 360 * 29.530588 };
  }

  return { night, altAz, track, events, facts, moon };
}
