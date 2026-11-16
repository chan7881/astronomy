// 순수 계산 — 화면·네트워크와 무관. test/model.test.js가 방향·부호까지 고정한다.

export const BAD_GRADIENT = 0.5;      // K/100m, 이보다 크면 「불량층」
export const TROPO_TOP_HPA = 200;     // 불량층·제트 탐색의 위쪽 한계
const KAPPA = 0.286;
const LAMBDA = 500e-9;                // 시상 계산 파장(m)
const RAD2ARCSEC = 206264.806;

export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/** 온위(K). T는 섭씨, p는 hPa */
export function theta(tC, p) {
  return (tC + 273.15) * Math.pow(1000 / p, KAPPA);
}

/**
 * 인접 기압면 사이의 층 목록.
 * levels: [{p, T(℃), z(m), ws(m/s), wd(°)}] — 순서 무관, 지면 아래(z < elev)는 버린다.
 * 반환: 아래→위 [{pMid, zBot, zTop, dz, tMidK, grad(K/100m, 온위 증가가 +), shear(1/s)}]
 */
export function layers(levels, elev = 0) {
  const lv = levels
    .filter(l => [l.p, l.T, l.z].every(Number.isFinite) && l.z >= elev)
    .sort((a, b) => a.z - b.z);
  const out = [];
  for (let i = 0; i + 1 < lv.length; i++) {
    const a = lv[i], b = lv[i + 1];
    const dz = b.z - a.z;
    if (!(dz > 0)) continue;
    const thA = theta(a.T, a.p), thB = theta(b.T, b.p);
    const [ua, va] = uv(a), [ub, vb] = uv(b);
    out.push({
      pMid: (a.p + b.p) / 2, zBot: a.z, zTop: b.z, dz,
      tMidK: (a.T + b.T) / 2 + 273.15,
      thMid: (thA + thB) / 2,
      grad: (thB - thA) / dz * 100,
      shear: Number.isFinite(a.ws) && Number.isFinite(b.ws) ? Math.hypot(ub - ua, vb - va) / dz : 0,   // 바람이 빠진 면은 시어 0
    });
  }
  return out;
}

function uv(l) {
  const ws = Number.isFinite(l.ws) ? l.ws : 0;
  const wd = Number.isFinite(l.wd) ? l.wd : 0;
  const r = wd * Math.PI / 180;
  return [-ws * Math.sin(r), -ws * Math.cos(r)];
}

/**
 * 불량층: 대류권(p ≥ 200hPa)에서 온위 기울기가 기준을 넘는 연속 구간 가운데 기울기가 가장 큰 것.
 * 반환: {bot(km), top(km), grad(K/100m)} 또는 null
 */
export function badLayer(levels, elev = 0) {
  const ls = layers(levels, elev).filter(l => l.pMid >= TROPO_TOP_HPA);
  let best = null, run = null;
  for (const l of ls) {
    if (l.grad > BAD_GRADIENT) {
      if (!run) run = { bot: l.zBot, top: l.zTop, grad: l.grad };
      else { run.top = l.zTop; run.grad = Math.max(run.grad, l.grad); }
    } else if (run) { if (!best || run.grad > best.grad) best = run; run = null; }
  }
  if (run && (!best || run.grad > best.grad)) best = run;
  return best && { bot: best.bot / 1000, top: best.top / 1000, grad: best.grad };
}

/** 제트기류: 300~200hPa 풍속의 최댓값(m/s) */
export function jetSpeed(levels) {
  const v = levels.filter(l => l.p <= 300 && l.p >= TROPO_TOP_HPA && Number.isFinite(l.ws)).map(l => l.ws);
  return v.length ? Math.max(...v) : null;
}

/**
 * 자유대기 시상(″) — Dewan(1993) 식.
 *   Cn² = 2.8 M² L0^(4/3),  M = -(79e-6 P/T) ∂lnθ/∂z
 *   L0^(4/3) = 0.1^(4/3)·10^(1.64+42S) (대류권) / 10^(0.506+50S) (성층권),  S = 바람 시어(1/s)
 *   r0 = (0.423 k² ∫Cn² dz)^(-3/5),  시상 = 0.98 λ / r0
 * 보정 전 값. 화면에는 FREE_SCALE을 곱한 freeSeeing을 쓴다.
 */
export function dewanSeeing(levels, elev = 0) {
  let integral = 0;
  const ls = layers(levels, elev);
  if (ls.length < 3) return null;   // 상층 자료가 없으면 「좋음」이 아니라 「모름」
  for (const l of ls) {
    const s = Math.min(l.shear, 0.02);
    const tropo = l.pMid >= TROPO_TOP_HPA;
    const L43 = Math.pow(0.1, 4 / 3) * Math.pow(10, tropo ? 1.64 + 42 * s : 0.506 + 50 * s);
    const dlnTheta = (l.grad / 100) / l.thMid;
    const M = -(79e-6 * l.pMid / l.tMidK) * dlnTheta;
    integral += 2.8 * M * M * L43 * l.dz;
  }
  if (!(integral > 0)) return 0;
  const k = 2 * Math.PI / LAMBDA;
  const r0 = Math.pow(0.423 * k * k * integral, -3 / 5);
  return 0.98 * LAMBDA / r0 * RAD2ARCSEC;
}

/**
 * 자유대기 시상 보정 배율 — ESO 파라날 MASS 관측(2023년 3,233시간)에 맞춘 값.
 * 12개 기압면에서 계산한 Dewan 값은 관측보다 약 18% 크게 나온다(2024년 검증: 치우침 +0.10″ → +0.02″).
 * 기압면을 바꾸면 다시 맞춰야 한다(27개 면에서는 0.74~0.77) — api.js LEVELS가 아래와 다르면 테스트가 실패한다.
 * 다시 맞추는 법: docs/시상보정.md · tools/seeing/
 */
export const FREE_SCALE = 0.84;
export const FREE_SCALE_LEVELS = [1000, 925, 850, 700, 600, 500, 400, 300, 250, 200, 150, 100];

/**
 * 리처드슨 지표 R(km) — 대류권(p ≥ 200hPa) 층마다 두께(km) × min(1/Ri, 4)를 더한다.
 *   Ri = (g/θ)(∂θ/∂z) / (∂u/∂z)²,  불안정하거나 중립인 층(N² ≤ 0)은 상한 4로 센다.
 * meteoblue가 쓰는 청천난류 기준(Ri ≤ 0.25)을 연속값으로 바꾼 것. 성긴 기압면에서 뭉개진 시어를 보충한다.
 */
export function richardsonIndex(levels, elev = 0) {
  let r = 0;
  for (const l of layers(levels, elev)) {
    if (l.pMid < TROPO_TOP_HPA) continue;
    const N2 = 9.81 / l.thMid * l.grad / 100, S2 = l.shear * l.shear;
    r += l.dz / 1000 * (N2 > 0 ? Math.min(S2 / N2, 4) : 4);
  }
  return r;
}
/**
 * 자유대기 = FREE_SCALE × Dewan × e^(RI_COEF·(min(R, RI_MAX) − RI_REF)) — 파라날 2023년에 맞추고 2024년으로 검증(docs/시상보정.md 4절).
 * RI_MAX: 맞춘 자료의 99% 이상이 이 아래(파라날 99% 6.7). 그 위로는 배율을 늘리지 않는다(최대 ×1.23).
 */
export const RI_COEF = 0.034, RI_REF = 2, RI_MAX = 8;

/** 자유대기 시상(″) — 보정한 값 */
export function freeSeeing(levels, elev = 0) {
  const s = dewanSeeing(levels, elev);
  return s == null ? null : s * FREE_SCALE * Math.exp(RI_COEF * (Math.min(richardsonIndex(levels, elev), RI_MAX) - RI_REF));
}

/**
 * 지표층 시상(″) — 지상풍이 셀수록 나빠지는 경험식.
 * 파라날에서 맞춘 값(0.48 + 0.066×풍속)과 거의 같아 그대로 둔다. 다만 파라날 관측기는 높은 산 위 탑에 있어
 * 낮은 관측지의 지표층은 이보다 클 수 있다(맞출 관측 자료 없음).
 */
export function groundSeeing(wind10) {
  return 0.5 + 0.06 * Math.max(0, wind10 || 0);
}

/** 전체 시상(″): 두 성분을 5/3 제곱 합으로 합친다 */
export function seeing(levels, wind10, elev = 0) {
  const a = freeSeeing(levels, elev), b = groundSeeing(wind10);
  if (a == null) return null;
  return Math.pow(Math.pow(a, 5 / 3) + Math.pow(b, 5 / 3), 3 / 5);
}

/** 시상 지수 1(나쁨)~5(매우 좋음) */
export function seeingIndex(arcsec) {
  if (!Number.isFinite(arcsec)) return null;
  return arcsec < 1.0 ? 5 : arcsec < 1.5 ? 4 : arcsec < 2.0 ? 3 : arcsec < 3.0 ? 2 : 1;
}

// 등급: 'g' 좋음 · 'm' 보통 · 'b' 나쁨
export const gradeSeeing = a => !Number.isFinite(a) ? null : a < 1.5 ? 'g' : a < 2.2 ? 'm' : 'b';
export const gradeJet = v => !Number.isFinite(v) ? null : v <= 20 ? 'g' : v <= 30 ? 'm' : 'b';
export const gradeCloud = c => !Number.isFinite(c) ? null : c <= 20 ? 'g' : c <= 60 ? 'm' : 'b';
export const gradeDew = d => !Number.isFinite(d) ? null : d >= 4 ? 'g' : d >= 2 ? 'm' : 'b';
export const gradeAod = a => !Number.isFinite(a) ? null : a < 0.15 ? 'g' : a < 0.35 ? 'm' : 'b';
export const gradeScore = s => !Number.isFinite(s) ? null : s >= 70 ? 'g' : s >= 40 ? 'm' : 'b';
export const GRADE_KO = { g: '좋음', m: '보통', b: '나쁨' };

/**
 * 한 시각의 관측 점수(0~100). 구름이 전체를 깎고, 나머지가 그 안에서 가감한다.
 * h: {cloud(%), seeing(″), aod, moonAlt(°), moonFrac(0~1)}
 */
export function hourScore(h) {
  const clear = 1 - clamp((h.cloud ?? 0) / 100, 0, 1);
  const see = Number.isFinite(h.seeing) ? clamp((3 - h.seeing) / 2, 0, 1) : 0.5;
  const trans = Number.isFinite(h.aod) ? clamp(1 - h.aod / 0.5, 0, 1) : 0.7;
  const moonUp = Math.max(0, Math.sin((h.moonAlt ?? -90) * Math.PI / 180));
  const dark = 1 - clamp((h.moonFrac ?? 0) * moonUp, 0, 1);
  return 100 * clear * (0.45 + 0.25 * see + 0.12 * trans + 0.18 * dark);
}

/**
 * 가장 좋은 연속 구간: 최고 점수 시각을 포함하고 최고점의 85% 이상이 이어지는 범위.
 * hours: [{t(ms), score}] 시간순. 반환 {from, to(끝 시각, ms), peak} 또는 null(최고점 40 미만)
 */
export function bestWindow(hours, stepMs = 3600e3) {
  if (!hours.length) return null;
  let iMax = 0;
  hours.forEach((h, i) => { if (h.score > hours[iMax].score) iMax = i; });
  const peak = hours[iMax].score;
  if (peak < 40) return null;
  let a = iMax, b = iMax;
  while (a > 0 && hours[a - 1].score >= 0.85 * peak) a--;
  while (b + 1 < hours.length && hours[b + 1].score >= 0.85 * peak) b++;
  return { from: hours[a].t, to: hours[b].t + stepMs, peak };
}

/** 기온 − 이슬점. 어느 한쪽이 없으면 null */
export const spread = (t, d) => (Number.isFinite(t) && Number.isFinite(d) ? t - d : null);

export const mean = xs => {
  const v = xs.filter(Number.isFinite);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
};

/**
 * 밤 요약. hours: 어두운 시간대의 시각별 자료
 *   {t, cloud, low, mid, high, seeing, jet, temp, dew, wind10, gust, precipProb, aod, score}
 * 반환: {score, grade, window, cloudAvg, seeingAvg, jetMax, dewMin, cloudNote, cautions[]}
 */
export function nightSummary(hours) {
  if (!hours.length) return null;
  const score = mean(hours.map(h => h.score));
  const dewMin = Math.min(...hours.map(h => spread(h.temp, h.dew)).filter(Number.isFinite));
  const jetMax = Math.max(...hours.map(h => h.jet).filter(Number.isFinite));
  const cautions = [];
  if (hours.some(h => (h.precipProb ?? 0) >= 40)) cautions.push('강수');
  if (Number.isFinite(dewMin) && dewMin < 2) cautions.push('결로');
  if (Number.isFinite(jetMax) && jetMax > 30) cautions.push('제트기류 강함');
  if (hours.some(h => (h.gust ?? 0) >= 12 || (h.wind10 ?? 0) >= 8)) cautions.push('강풍');
  if (hours.some(h => gradeAod(h.aod) === 'b')) cautions.push('연무·먼지');
  return {
    score, grade: gradeScore(score), window: bestWindow(hours),
    cloudAvg: mean(hours.map(h => h.cloud)), seeingAvg: mean(hours.map(h => h.seeing)),
    jetMax: Number.isFinite(jetMax) ? jetMax : null, dewMin: Number.isFinite(dewMin) ? dewMin : null,
    cloudNote: cloudNote(hours), cautions,
  };
}

/** 구름 한 줄: {kind:'clear'|'overcast'|'in'|'out'|'avg', t?, layer?, avg} */
export function cloudNote(hours) {
  const avg = mean(hours.map(h => h.cloud));
  const max = Math.max(...hours.map(h => h.cloud ?? 0));
  const min = Math.min(...hours.map(h => h.cloud ?? 0));
  if (max <= 20) return { kind: 'clear', avg };
  if (min >= 80) return { kind: 'overcast', avg };
  const LAYERS = [['low', '하층운'], ['mid', '중층운'], ['high', '상층운']];
  for (let i = 1; i < hours.length; i++) {
    const p = hours[i - 1], c = hours[i];
    if (p.cloud < 50 && c.cloud >= 50) {
      const top = LAYERS.map(([k, ko]) => [c[k] ?? 0, ko]).sort((x, y) => y[0] - x[0])[0];
      return { kind: 'in', t: c.t, layer: top[1], avg };
    }
    if (p.cloud >= 50 && c.cloud < 50) return { kind: 'out', t: c.t, avg };
  }
  return { kind: 'avg', avg };
}

/** 달 위상 이름. deg: 황경차 0(삭)~360 */
export function moonPhaseName(deg) {
  const d = ((deg % 360) + 360) % 360, tol = 6;
  if (d < tol || d > 360 - tol) return '삭';
  if (Math.abs(d - 90) < tol) return '상현달';
  if (Math.abs(d - 180) < tol) return '보름달';
  if (Math.abs(d - 270) < tol) return '하현달';
  return d < 90 ? '초승달' : d < 180 ? '차오르는 달' : d < 270 ? '기우는 달' : '그믐달';
}

/** 시직경(″). radiusKm 천체 반지름, distAu 거리 */
export function angularDiameter(radiusKm, distAu) {
  return 2 * Math.atan(radiusKm / (distAu * 149597870.7)) * RAD2ARCSEC;
}

const DIRS = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
export const compass = az => DIRS[Math.round((((az % 360) + 360) % 360) / 22.5) % 16];
