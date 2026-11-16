// 위젯 배치 — 자료(widgetModel)를 그리기 명령 목록으로 바꾼다. 순수 계산이라 PC에서 SVG로 미리 본다.
// 명령: rect · line · poly · circle · text (좌표는 pt, 글자의 y는 줄 상자의 위쪽)
import { T } from './theme.js';
import { bandHours } from './data.js';
import { clock, cloudLine } from '../js/view.js';
import { hourTicks, DASH, CLOUD_INK_FLIP } from '../js/charts.js';
import { GRADE_KO, gradeSeeing, gradeJet, gradeDew } from '../js/model.js';

export const SIZES = { small: [158, 158], medium: [338, 158], large: [338, 354] };
export const KINDS = {
  점수: 'small', 달: 'small', 대기: 'small', 지금: 'small',
  판정: 'medium', 고도: 'medium', '5일': 'medium', 시간별: 'medium',
  종합: 'large', 천체: 'large', 예보: 'large',
};
export const DEFAULT_KIND = { small: '점수', medium: '판정', large: '종합' };

const PAD = 14, HEAD = 26;
const fin = Number.isFinite;

// ── 그리기 명령 모으개 ─────────────────────────────────
function canvas(w, h) {
  const ops = [];
  return {
    w, h, ops,
    rect: (x, y, w, h, o = {}) => ops.push({ op: 'rect', x, y, w, h, r: 0, ...o }),
    line: (x1, y1, x2, y2, color = T.line, sw = 1) => ops.push({ op: 'line', x1, y1, x2, y2, color, sw }),
    poly: (pts, o = {}) => pts.length > 1 && ops.push({ op: 'poly', pts, ...o }),
    circle: (cx, cy, r, o = {}) => ops.push({ op: 'circle', cx, cy, r, ...o }),
    text: (text, x, y, o = {}) => ops.push({ op: 'text', text: String(text), x, y, size: 12, weight: 'm', color: T.ink, align: 'l', ...o }),
  };
}

/** 글자 너비 어림(pt). 한글 1em, 숫자·영문 0.6em */
export function textWidth(s, size) {
  let em = 0;
  for (const ch of String(s)) em += /[ᄀ-ᇿ　-鿿가-힣]/.test(ch) ? 1 : ch === ' ' ? 0.3 : /[.,:·°″′]/.test(ch) ? 0.32 : 0.6;
  return em * size;
}

/** 너비 max에 들어가게 앞에서부터 자르고 …을 붙인다 */
export function fit(s, size, max) {
  s = String(s);
  if (textWidth(s, size) <= max) return s;
  let out = '';
  for (const ch of s) { if (textWidth(out + ch + '…', size) > max) break; out += ch; }
  return out + '…';
}

/** 등급 모양: 좋음 ●, 보통 ▲, 나쁨 ■ (색 + 모양 + 글자의 「모양」) */
function mark(c, g, cx, cy, s = 4) {
  if (!g) return;
  if (g === 'g') c.circle(cx, cy, s, { fill: T.g });
  else if (g === 'm') c.poly([[cx, cy - s], [cx + s * 1.1, cy + s * 0.85], [cx - s * 1.1, cy + s * 0.85]], { fill: T.m, close: true });
  else c.rect(cx - s * 0.9, cy - s * 0.9, s * 1.8, s * 1.8, { fill: T.b });
}

/** 모양 + 등급 글자를 x부터 나란히. 끝 x를 돌려준다 */
function tag(c, g, x, y, size = 12, label = g ? GRADE_KO[g] : '') {
  if (!g) return x;
  mark(c, g, x + size * 0.42, y + size * 0.62, size * 0.36);
  c.text(label, x + size * 1.05, y, { size, weight: 'b', color: T[g] });
  return x + size * 1.05 + textWidth(label, size);
}

function frame(kind, title, right) {
  const [w, h] = SIZES[KINDS[kind]];
  const c = canvas(w, h);
  c.rect(0, 0, w, h, { fill: T.card });
  c.rect(0, 0, w, HEAD, { fill: T.band });
  c.line(0, HEAD, w, HEAD, T.edge);
  c.text(title, PAD, 6, { size: 11, weight: 'h' });
  if (right) c.text(fit(right, 11, w - 2 * PAD - textWidth(title, 11) - 8), w - PAD, 6, { size: 11, color: T.ink3, align: 'r' });
  return c;
}

/** 이름표 행들: [[이름, 값 | 그리는 함수(x, y)]] */
function rows(c, list, x, y, w, { rh = 22, size = 12, lw = 36 } = {}) {
  list.forEach(([k, v], i) => {
    const ty = y + i * rh + (rh - size * 1.2) / 2;
    c.text(k, x, ty, { size, weight: 'b', color: T.ink3 });
    if (typeof v === 'function') v(x + lw, ty); else c.text(v, x + lw, ty, { size });
    if (i < list.length - 1) c.line(x, y + (i + 1) * rh, x + w, y + (i + 1) * rh);
  });
}

function scoreBox(c, s, x, y, w, h, numSize, withTag) {
  const col = s ? T[s.grade] : T.ink3;
  c.rect(x, y, w, h, { fill: col, r: 10 });
  c.rect(x + 6, y + 2, w - 8, h - 4, { fill: T.card, r: 8 });
  const cx = x + 3 + w / 2, th = numSize * 1.2 + (withTag ? 15 : 0), ty = y + (h - th) / 2;
  c.text(s ? Math.round(s.score) : '–', cx, ty, { size: numSize, weight: 'h', align: 'c' });
  if (withTag && s) {
    const label = GRADE_KO[s.grade], tw = 11 * 1.05 + textWidth(label, 11);
    tag(c, s.grade, cx - tw / 2, ty + numSize * 1.2 + 1, 11);
  }
}

/** 달 모양 다각형. deg: 황경차(0 삭 → 180 보름 → 360). 북반구에서 차오르는 달은 오른쪽이 밝고, 남반구(south)에서는 왼쪽이 밝다. */
export function moonShape(deg, cx, cy, r, n = 24, south = false) {
  const d = ((deg % 360) + 360) % 360, waxing = d <= 180, k = Math.cos((waxing ? d : 360 - d) * Math.PI / 180), sx = (waxing ? 1 : -1) * (south ? -1 : 1);
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; pts.push([cx + sx * r * Math.cos(a), cy + r * Math.sin(a)]); }
  for (let i = n; i >= 0; i--) { const a = -Math.PI / 2 + Math.PI * i / n; pts.push([cx + sx * r * k * Math.cos(a), cy + r * Math.sin(a)]); }
  return pts;
}

function moonDisc(c, deg, cx, cy, r, south) {
  c.circle(cx, cy, r, { fill: T.band, stroke: T.edge });
  c.poly(moonShape(deg, cx, cy, r, 24, south), { fill: T.body.Moon, close: true });
}

/** 꺾은선을 점선 조각들로 나눈다. pattern: [그리기, 띄우기, …] */
export function dashes(pts, pattern) {
  const out = [];
  let cur = [pts[0]], pi = 0, left = pattern[0], on = true;
  for (let i = 1; i < pts.length; i++) {
    let [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    let seg = Math.hypot(x1 - x0, y1 - y0);
    while (seg > left) {
      const f = left / seg, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f;
      if (on) { cur.push([x, y]); out.push(cur); }
      seg -= left; x0 = x; y0 = y;
      pi = (pi + 1) % pattern.length; left = pattern[pi]; on = !on;
      cur = on ? [[x, y]] : [];
    }
    left -= seg;
    if (on) cur.push([x1, y1]);
  }
  if (on && cur.length > 1) out.push(cur);
  return out;
}

// ── 그림: 고도 곡선 ────────────────────────────────────
function altChart(c, m, v, bx, by, bw, bh) {
  const GX = 22, x0 = bx + GX, x1 = bx + bw - 4, ph = bh - 14, yb = by + ph;
  const X = t => x0 + (t - v.t0) / (v.t1 - v.t0) * (x1 - x0), Y = a => yb - a / 90 * (ph - 6);
  const n = v.night;
  const seg = (a, b, i) => { if (a != null && b != null && b > a) c.rect(X(a), by, X(b) - X(a), ph, { fill: T.tw[i] }); };
  c.rect(x0, by, x1 - x0, ph, { fill: T.tw[4] });
  seg(v.t0, n.sunset, 0); seg(n.sunset, n.civilEnd, 1); seg(n.civilEnd, n.nautEnd, 2); seg(n.nautEnd, n.astroEnd, 3);
  seg(n.astroStart, n.nautStart, 3); seg(n.nautStart, n.civilStart, 2); seg(n.civilStart, n.sunrise, 1); seg(n.sunrise, v.t1, 0);
  for (const a of [30, 60]) { c.line(x0, Y(a), x1, Y(a), T.line); c.text(a + '°', x0 - 4, Y(a) - 6, { size: 9, color: T.ink3, align: 'r' }); }
  c.line(x0, yb, x1, yb, T.edge);
  for (const k of hourTicks({ t0: v.t0, t1: v.t1 }, m.offMs / 1000)) c.text(k.label, X(k.t), yb + 2, { size: 9, color: T.ink3, align: 'c' });

  const placed = [];
  for (const tr of v.tracks.filter(t => !t.outer)) {
    const col = T.body[tr.id], pat = DASH[tr.id] ? DASH[tr.id].split(' ').map(Number) : null;
    // 지평선 위 구간만. 지평선을 넘는 자리는 보간한다
    let run = [], top = null;
    const flush = () => { if (run.length > 1) (pat ? dashes(run, pat) : [run]).forEach(p => c.poly(p, { stroke: col, sw: 1.8 })); run = []; };
    tr.pts.forEach((p, i) => {
      const q = tr.pts[i - 1];
      if (q && (q.alt >= 0) !== (p.alt >= 0)) { const f = q.alt / (q.alt - p.alt); run.push([X(q.t + (p.t - q.t) * f), yb]); }
      if (p.alt >= 0) { run.push([X(p.t), Y(p.alt)]); if (!top || p.alt > top.alt) top = p; } else flush();
    });
    flush();
    if (top && top.alt > 8) {
      const w = textWidth(tr.ko, 10), lx = Math.min(Math.max(X(top.t), x0 + w / 2 + 1), x1 - w / 2 - 1);
      const hit = y => placed.some(p => Math.abs(p.x - lx) < (p.w + w) / 2 + 2 && Math.abs(p.y - y) < 11);
      let ly = Math.max(by, Y(top.alt) - 14);
      if (hit(ly)) ly = Y(top.alt) + 3;
      if (!hit(ly)) { placed.push({ x: lx, y: ly, w }); c.text(tr.ko, lx, ly, { size: 10, weight: 'b', color: col, align: 'c' }); }
    }
  }
  if (m.now > v.t0 && m.now < v.t1) c.line(X(m.now), by, X(m.now), yb, T.ink, 1);
}

// ── 그림: 시간별 기상 띠 ───────────────────────────────
const BAND_ROWS = [
  ['구름', h => h.cloud, null, v => Math.round(v)],
  ['시상', h => h.seeing, gradeSeeing, v => v.toFixed(1)],
  ['제트', h => h.jet, gradeJet, v => Math.round(v)],
  ['이슬', h => h.spread, gradeDew, v => v.toFixed(1)],
];

function bandChart(c, m, v, bx, by, bw, bh) {
  const { hh } = clock(m.offMs), hours = bandHours(v);
  if (!hours.length) { c.text('예보 자료 없음', bx + bw / 2, by + bh / 2 - 8, { size: 12, color: T.ink3, align: 'c' }); return; }
  const GX = 30, cw = (bw - GX - 4) / 12, rh = (bh - 13) / BAND_ROWS.length;
  BAND_ROWS.forEach(([name, val, grade, fmt], r) => {
    const y = by + r * rh, ty = y + (rh - 1 - 9.5 * 1.2) / 2;
    c.text(name, bx + 4, y + (rh - 1 - 12) / 2, { size: 10, weight: 'b', color: T.ink3 });
    hours.forEach((h, i) => {
      const x = bx + GX + i * cw, x_ = x + 0.5, w = cw - 1, hgt = rh - 1, value = val(h);
      if (!fin(value)) { c.rect(x_, y, w, hgt, { fill: T.na, r: 3 }); return; }
      const g = grade ? grade(value) : null;
      if (g) c.rect(x_, y, w, hgt, { fill: T.cell[g], r: 3 });
      else { c.rect(x_, y, w, hgt, { fill: T.cbase, r: 3 }); c.rect(x_, y, w, hgt, { fill: T.cloud, r: 3, alpha: Math.min(1, Math.max(0, value / 100)) }); }
      c.text(fmt(value), x + cw / 2, ty, { size: 9.5, color: !g && Math.round(value) >= CLOUD_INK_FLIP ? T.bg : T.ink, align: 'c' });
      if (g && g !== 'g') mark(c, g, x + cw - 4.5, y + 4.5, 2);
    });
  });
  hours.forEach((h, i) => c.text(hh(h.t), bx + GX + i * cw + cw / 2, by + bh - 12, { size: 9, color: T.ink3, align: 'c' }));
}

// ── 글귀 ───────────────────────────────────────────────
const dateText = (m, v) => `${m.place.name} · ${v.month}.${v.day} ${v.wd}`;
function winShort(m, v) {
  const { hh, hm } = clock(m.offMs), w = v.summary && v.summary.window;
  if (!w) return '없음';
  const to = Math.min(w.to, v.darkTo);
  return hh(w.from) === hh(to) ? `${hm(w.from)}–${hm(to)}` : `${hh(w.from)}–${hh(to)}시`;   // 한 시간이 안 되면 분까지
}
function winLong(m, v) {
  const { hm } = clock(m.offMs), w = v.summary && v.summary.window;
  return w ? `${hm(w.from)}–${hm(Math.min(w.to, v.darkTo))}` : '없음';
}
const pct = x => (fin(x) ? `${Math.round(x)}%` : '–');
const cautionRow = (c, s) => (x, y) => {
  if (!s || !s.cautions.length) { c.text('없음', x, y); return; }
  tag(c, 'b', x, y, 12, s.cautions.join(' · '));
};

// ── 위젯 11종 ──────────────────────────────────────────
const LAYOUTS = {
  점수(m) {
    const v = m.nights[0], s = v.summary, c = frame('점수', '오늘 밤', m.place.name);
    scoreBox(c, s, PAD, 36, 62, 54, 28, false);
    if (s) tag(c, s.grade, 86, 43, 15);
    c.text('관측 점수', 86, 65, { size: 11, color: T.ink2 });
    rows(c, [['최적', winShort(m, v)], ['구름', pct(s && s.cloudAvg)]], PAD, 100, 130);
    return c;
  },
  달(m) {
    const v = m.nights[0], { hm } = clock(m.offMs), c = frame('달', '달', `월령 ${v.moon.age.toFixed(1)}`);
    moonDisc(c, v.moon.deg, 41, 63, 25, m.place.lat < 0);
    c.text(v.moon.name, 78, 45, { size: 15, weight: 'b' });
    c.text(`밝은 면 ${Math.round(v.moon.frac * 100)}%`, 78, 66, { size: 11, color: T.ink2 });
    rows(c, [['뜸', hm(v.moonEv.rise)], ['짐', hm(v.moonEv.set)]], PAD, 100, 130);
    return c;
  },
  대기(m) {
    const v = m.nights[0], s = v.summary, c = frame('대기', '대기', m.place.name);
    const see = s && fin(s.seeingAvg) ? s.seeingAvg.toFixed(1) : '–';
    c.text(see, PAD, 33, { size: 30, weight: 'h' });
    c.text('″', PAD + textWidth(see, 30) + 1, 36, { size: 15, weight: 'b' });
    if (s) tag(c, gradeSeeing(s.seeingAvg), PAD + textWidth(see, 30) + 14, 47, 13);
    c.text('시상 평균', PAD, 71, { size: 11, color: T.ink2 });
    const val = (txt, g, extra) => (x, y) => { c.text(txt, x, y); if (g) tag(c, g, x + textWidth(txt, 12) + 5, y, 12, extra || GRADE_KO[g]); };
    rows(c, [
      ['제트', s && fin(s.jetMax) ? val(`${Math.round(s.jetMax)}m/s`, gradeJet(s.jetMax)) : '–'],
      ['이슬', s && fin(s.dewMin) ? val(`${s.dewMin.toFixed(1)}°`, gradeDew(s.dewMin), gradeDew(s.dewMin) === 'b' ? '결로' : null) : '–'],
    ], PAD, 92, 130);
    return c;
  },
  지금(m) {
    const { hm } = clock(m.offMs), b = m.nowBody, c = frame('지금', m.isNow ? '지금' : '해진 뒤', hm(m.evalT));
    if (b) {
      c.text(b.ko, PAD, 33, { size: 30, weight: 'h', color: T.body[b.id] });
      c.text(`${b.mag.toFixed(1)}등급 · ${b.constellation}`, PAD, 71, { size: 11, color: T.ink2 });
      rows(c, [['고도', `${Math.round(b.alt)}° ${b.dir}`], ['짐', hm(b.set)]], PAD, 92, 130);
    } else {
      c.text('없음', PAD, 33, { size: 30, weight: 'h', color: T.ink3 });
      c.text('떠 있는 행성', PAD, 71, { size: 11, color: T.ink2 });
      const n = m.nextRise;
      rows(c, [['다음', n ? n.ko : '–'], ['뜸', n ? hm(n.rise) : '–']], PAD, 92, 130);
    }
    return c;
  },
  판정(m) {
    const v = m.nights[0], s = v.summary, { hh } = clock(m.offMs), c = frame('판정', '오늘 밤 판정', dateText(m, v));
    scoreBox(c, s, PAD, 40, 86, 96, 36, true);
    rows(c, [
      ['최적', winLong(m, v)],
      ['달', `${v.moon.name} · ${v.moonEvent}`],
      ['구름', s ? `평균 ${pct(s.cloudAvg)}${s.cloudNote.kind === 'avg' ? '' : ' · ' + cloudLine(s.cloudNote, hh)}` : '–'],
      ['주의', cautionRow(c, s)],
    ], 114, 40, 210, { rh: 24 });
    return c;
  },
  고도(m) {
    const v = m.nights[0], c = frame('고도', '밤하늘', dateText(m, v));
    altChart(c, m, v, 8, 34, 322, 118);
    return c;
  },
  '5일'(m) {
    const c = frame('5일', '5일 밤', m.place.name), cw = (338 - 20) / 5, top = 44, base = 106;
    m.nights.forEach((v, i) => {
      const s = v.summary, cx = 10 + i * cw + cw / 2;
      c.rect(cx - 15, top, 30, base - top, { fill: T.band, r: 4 });
      if (s) {
        const bh = Math.max(3, s.score / 100 * (base - top));
        c.rect(cx - 15, base - bh, 30, bh, { fill: T[s.grade], r: 4 });
        c.text(Math.round(s.score), cx, Math.max(base - bh - 17, top - 15), { size: 13, weight: 'h', align: 'c' });
        const label = GRADE_KO[s.grade], tw = 10 * 1.05 + textWidth(label, 10);
        tag(c, s.grade, cx - tw / 2, 110, 10);
      } else c.text('–', cx, top - 15, { size: 13, weight: 'h', align: 'c', color: T.ink3 });
      c.text(`${v.day} ${v.wd}`, cx, 126, { size: 10.5, weight: i ? 'm' : 'h', color: i ? T.ink3 : T.ink, align: 'c' });
    });
    return c;
  },
  시간별(m) {
    const v = m.nights[0], c = frame('시간별', '시간별', dateText(m, v));
    bandChart(c, m, v, 8, 34, 322, 118);
    return c;
  },
  종합(m) {
    const v = m.nights[0], s = v.summary, c = frame('종합', '오늘 밤', dateText(m, v));
    scoreBox(c, s, PAD, 36, 70, 66, 28, true);
    rows(c, [['최적', winLong(m, v)], ['달', `${v.moon.name} · ${v.moonEvent}`], ['주의', cautionRow(c, s)]], 98, 36, 226);
    altChart(c, m, v, 8, 110, 322, 122);
    bandChart(c, m, v, 8, 238, 322, 110);
    return c;
  },
  천체(m) {
    const v = m.nights[0], { hm } = clock(m.offMs), c = frame('천체', '천체', dateText(m, v));
    const cols = [[PAD, 'l', '천체'], [122, 'r', '뜸'], [172, 'r', '남중'], [216, 'r', '고도'], [272, 'r', '짐'], [324, 'r', '등급']];
    cols.forEach(([x, align, name]) => c.text(name, x, 35, { size: 10.5, weight: 'b', color: T.ink3, align }));
    const rh = (354 - 52 - 6) / 8;
    v.table.forEach((b, i) => {
      const y = 52 + i * rh, ty = y + (rh - 12 * 1.2) / 2;
      c.line(PAD, y, 324, y);
      const cells = [b.ko, hm(b.rise), hm(b.transit), `${Math.round(b.transitAlt)}°`, hm(b.set), (b.mag < 0 ? '−' : '') + Math.abs(b.mag).toFixed(1)];
      cells.forEach((t, k) => c.text(t, cols[k][0], ty, k ? { align: 'r' } : { weight: 'h', color: T.body[b.id] }));
    });
    return c;
  },
  예보(m) {
    const c = frame('예보', '5일 예보', m.place.name);
    const cols = [[PAD, 'l', '밤'], [112, 'r', '점수'], [164, 'r', '구름'], [208, 'r', '시상'], [252, 'r', '달'], [324, 'r', '최적']];
    cols.forEach(([x, align, name]) => c.text(name, x, 35, { size: 10.5, weight: 'b', color: T.ink3, align }));
    const rh = (354 - 52 - 6) / 5;
    m.nights.forEach((v, i) => {
      const s = v.summary, y = 52 + i * rh, ty = y + (rh - 12 * 1.2) / 2;
      c.line(PAD, y, 324, y);
      c.text(`${v.day} ${v.wd}`, PAD, ty, { weight: 'h' });
      c.text(s ? Math.round(s.score) : '–', 100, y + (rh - 17 * 1.2) / 2, { size: 17, weight: 'h', align: 'r' });
      if (s) mark(c, s.grade, 108, y + rh / 2, 4);
      c.text(pct(s && s.cloudAvg), 164, ty, { align: 'r' });
      c.text(s && fin(s.seeingAvg) ? `${s.seeingAvg.toFixed(1)}″` : '–', 208, ty, { align: 'r' });
      c.text(`${Math.round(v.moon.frac * 100)}%`, 252, ty, { align: 'r' });
      c.text(s && s.window ? winShort(m, v) : '—', 324, ty, { align: 'r' });
    });
    return c;
  },
};

/** kind의 위젯을 그리기 명령으로. 반환 {w, h, ops} */
export function layout(kind, model) {
  const c = LAYOUTS[kind](model);
  return { w: c.w, h: c.h, ops: c.ops };
}

/** 잠금 화면용 짧은 글귀 */
export function lockText(m) {
  const v = m.nights[0], s = v.summary;
  if (!s) return { score: null, grade: null, title: '관측 –', lines: ['예보 자료 없음'], inline: '관측 –', moonDeg: v.moon.deg };
  const sc = Math.round(s.score), cloud = `구름 ${pct(s.cloudAvg)}`, best = s.window ? winShort(m, v) : '최적 시간 없음';
  return {
    score: sc, grade: s.grade, moonDeg: v.moon.deg,
    title: `관측 ${sc} · ${GRADE_KO[s.grade]}`,
    lines: [s.window ? `최적 ${best}` : best, s.cautions.length ? `${cloud} · ${s.cautions[0]} 주의` : cloud],
    inline: `관측 ${sc} · ${best} · ${cloud}`,
  };
}

/** 잠금 화면 원형 위젯(66pt). 단색으로 물들므로 흰색의 진하기만 쓴다. kind가 '달'이면 달 모양, 아니면 점수 고리 */
export function lockCircle(kind, m) {
  const c = canvas(66, 66), L = lockText(m), WHITE = '#ffffff';
  if (kind === '달') {
    c.circle(33, 33, 21, { stroke: WHITE, sw: 2 });
    c.poly(moonShape(L.moonDeg, 33, 33, 21, 24, m.place.lat < 0), { fill: WHITE, close: true });
  } else {
    const R = 28, arc = (f0, f1) => {
      const k = Math.max(2, Math.round(48 * (f1 - f0)) + 1);
      return Array.from({ length: k }, (_, i) => {
        const t = (f0 + (f1 - f0) * i / (k - 1)) * 2 * Math.PI;
        return [33 + R * Math.sin(t), 33 - R * Math.cos(t)];
      });
    };
    c.poly(arc(0, 1), { stroke: WHITE, sw: 5, alpha: 0.3, close: true });
    if (L.score > 0) c.poly(arc(0, L.score / 100), { stroke: WHITE, sw: 5 });
    c.text(L.score == null ? '–' : L.score, 33, 17, { size: 20, weight: 'h', color: WHITE, align: 'c' });
    c.text('관측', 33, 40, { size: 9, weight: 'b', color: WHITE, align: 'c' });
  }
  return { w: c.w, h: c.h, ops: c.ops };
}
