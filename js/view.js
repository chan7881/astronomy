// 한 밤의 자료 조립. 화면(main.js)과 위젯(widget/)이 함께 쓴다 — DOM을 모른다.
import { seeing, seeingIndex, jetSpeed, badLayer, spread, hourScore, nightSummary } from './model.js';
import { BODIES } from './sky.js';

const HOUR = 3600e3;

/** 관측지 시간대(offMs)의 시각 표기 */
export function clock(offMs) {
  const local = t => new Date(t + offMs);
  return {
    local,
    hm: t => (t == null ? '–' : local(t).toISOString().slice(11, 16)),
    hh: t => String(local(t).getUTCHours()).padStart(2, '0'),
  };
}

/** 밤 번호 0의 현지 정오(ms). 아침 8시 전에는 지난밤을 「오늘 밤」으로 본다. */
export function baseNoon(now, offMs) {
  const d = new Date(now + offMs - 8 * HOUR);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12) - offMs;
}

/**
 * noon(그날 현지 정오)에 시작하는 밤 하나.
 * data: normalize()의 결과 또는 null. bodies: false면 천체 자취·제원을 건너뛴다(여러 밤의 요약만 필요할 때).
 * outer: 천왕성·해왕성을 표에 넣는다. outerTracks: 그 자취까지 계산한다(기본은 outer와 같다).
 */
export function nightView(sky, place, data, noon, { outer = false, outerTracks = outer, bodies = true, stepMin = 10 } = {}) {
  const night = sky.night(place, noon);
  const t0 = (night.sunset ?? noon + 6 * HOUR) - 20 * 60e3, t1 = (night.sunrise ?? noon + 18 * HOUR) + 20 * 60e3;
  const mid = (t0 + t1) / 2;
  const list = BODIES.filter(b => (bodies ? outer || !b.outer : b.id === 'Moon'));
  const tracks = bodies ? list.filter(b => outerTracks || !b.outer).map(b => ({ ...b, pts: sky.track(b.id, place, t0, t1, stepMin) })) : [];
  const table = list.map(b => ({ ...b, ...sky.events(b.id, place, noon), ...sky.facts(b.id, place, mid) }));
  const moon = sky.moon(mid), moonEv = table.find(b => b.id === 'Moon');

  const elev = data?.elev ?? place.elev ?? 0;
  const hours = (data?.hours ?? []).filter(h => h.t >= t0 - HOUR / 2 && h.t <= t1 + HOUR / 2).map(h => {
    const see = seeing(h.levels, h.wind10, elev);
    const x = {
      ...h, seeing: see, index: seeingIndex(see), jet: jetSpeed(h.levels), bad: badLayer(h.levels, elev),
      spread: spread(h.temp, h.dew), moonAlt: sky.altAz('Moon', place, h.t).alt, moonFrac: moon.frac,
    };
    x.score = hourScore(x);
    return x;
  });
  const darkFrom = night.astroEnd ?? night.sunset ?? t0, darkTo = night.astroStart ?? night.sunrise ?? t1;
  const dark = hours.filter(h => h.t >= darkFrom && h.t <= darkTo);
  return { noon, night, t0, t1, tracks, table, moon, moonEv, hours, dark, summary: nightSummary(dark), darkFrom, darkTo };
}

/** 달이 그 밤에 지는지·뜨는지 한 마디 */
export function moonEvent(sky, place, v, hm) {
  const { moonEv, night } = v, a = night.sunset, b = night.sunrise;
  const within = t => t != null && a != null && b != null && t > a && t < b;
  return within(moonEv.set) ? `${hm(moonEv.set)} 짐` : within(moonEv.rise) ? `${hm(moonEv.rise)} 뜸`
    : sky.altAz('Moon', place, (v.darkFrom + v.darkTo) / 2).alt > 0 ? '밤새 떠 있음' : '밤새 없음';
}

export function moonLine(sky, place, v, hm) {
  return `${Math.round(v.moon.frac * 100)}% ${v.moon.name} · ${moonEvent(sky, place, v, hm)}`;
}

export function cloudLine(n, hh) {
  if (!n) return '–';
  switch (n.kind) {
    case 'clear': return '밤새 맑음';
    case 'overcast': return '밤새 흐림';
    case 'in': return `${hh(n.t)}시부터 ${n.layer} 유입`;
    case 'out': return `${hh(n.t)}시부터 갬`;
    default: return `평균 ${Math.round(n.avg)}%`;
  }
}
