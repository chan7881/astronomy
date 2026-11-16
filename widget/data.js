// 위젯이 그릴 자료 — 한 번 계산해 모든 위젯이 나눠 쓴다. 순수 계산.
import { BODIES } from '../js/sky.js';
import { baseNoon, nightView, clock, moonEvent } from '../js/view.js';
import { compass } from '../js/model.js';

const DAY = 86400e3, NIGHTS = 5;
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/** 달을 뺀 천체 가운데 t에 가장 높이 뜬 것. 맨눈 행성이 먼저, 없으면 천왕성·해왕성. 없으면 null */
export function highestBody(sky, place, t) {
  const up = BODIES.filter(b => b.id !== 'Moon').map(b => ({ ...b, ...sky.altAz(b.id, place, t) })).filter(b => b.alt > 0);
  const best = xs => xs.reduce((a, b) => (a && a.alt >= b.alt ? a : b), null);
  return best(up.filter(b => !b.outer)) || best(up);
}

/** 「지금」 위젯이 볼 시각과 그 저녁의 정오. a: 오늘 밤(또는 지난밤), b: 그다음 밤. 박명이 없는 곳(백야·극야)은 지금 */
export function nowTime(now, a, b) {
  const n = a.night;
  if (n.civilEnd == null || n.civilStart == null) return { evalT: now, noon: a.noon };
  if (now < n.civilEnd) return { evalT: n.civilEnd, noon: a.noon };
  if (now <= n.civilStart) return { evalT: now, noon: a.noon };
  return b.night.civilEnd == null ? { evalT: now, noon: b.noon } : { evalT: b.night.civilEnd, noon: b.noon };
}

/** 띠 그림에 쓸 시간별 자료: 해진 뒤 첫 정시부터 n칸 */
export function bandHours(v, n = 12) {
  const from = v.night.sunset ?? v.t0;
  return v.hours.filter(h => h.t >= from).slice(0, n);
}

/**
 * place {name, lat, lon, elev}, data: normalize() 결과(없으면 null — 천체만 그린다), now: ms
 */
export function widgetModel(sky, place, data, now) {
  const offMs = (data ? data.offsetSec : Math.round(place.lon / 15) * 3600) * 1000;
  const c = clock(offMs), base = baseNoon(now, offMs);
  const nights = Array.from({ length: NIGHTS }, (_, i) => {
    const v = nightView(sky, place, data, base + i * DAY, { bodies: i === 0, outer: true, outerTracks: false });
    const d = c.local(v.noon);
    return { ...v, month: d.getUTCMonth() + 1, day: d.getUTCDate(), wd: WEEK[d.getUTCDay()], moonEvent: moonEvent(sky, place, v, c.hm) };
  });

  // 「지금」: 하늘이 어두울 때는 지금, 낮에는 다가오는 저녁의 시민박명이 끝나는 때를 본다.
  // 새벽 박명 뒤 아침 8시까지는 nights[0]이 지난밤이므로 다음 밤의 저녁을 본다.
  const { evalT, noon } = nowTime(now, nights[0], nights[1]);
  const hb = highestBody(sky, place, evalT);
  const ev = b => ({ ...b, ...sky.events(b.id, place, noon) });
  let nowBody = null, nextRise = null;
  if (hb) nowBody = { ...ev(hb), dir: compass(hb.az), ...sky.facts(hb.id, place, evalT) };
  else nextRise = BODIES.filter(b => b.id !== 'Moon').map(ev).filter(b => b.rise != null && b.rise > evalT).sort((a, b) => a.rise - b.rise)[0] || null;
  return { place, now, offMs, nights, evalT, isNow: evalT === now, nowBody, nextRise, hasData: !!data };
}
