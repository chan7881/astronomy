// SVG 문자열을 만든다. 두 그림은 같은 가로 눈금(W, 왼쪽 여백 GUTTER)을 쓴다.
export const W = 390, GUTTER = 38, PLOT_H = 150;
const VB_W = W + GUTTER;

export const DASH = { Jupiter: '7 4', Mercury: '2 4', Uranus: '10 3 2 3', Neptune: '1 5' };

export function scale(t0, t1) {
  return { t0, t1, x: t => (t - t0) / (t1 - t0) * W, t: x => t0 + x / W * (t1 - t0) };
}
export const altY = alt => PLOT_H - Math.max(-5, alt) / 90 * (PLOT_H - 10);
const n1 = v => v.toFixed(1);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** 현지 시각 3시간 간격 눈금 [{t, label}] */
export function hourTicks(sc, offsetSec, every = 3) {
  const out = [], H = 3600e3, off = offsetSec * 1000;
  let t = Math.ceil((sc.t0 + off) / H) * H - off;
  for (; t <= sc.t1; t += H) {
    const hr = new Date(t + off).getUTCHours();
    if (hr % every === 0) out.push({ t, label: String(hr).padStart(2, '0') });
  }
  return out;
}

function ticksSvg(sc, offsetSec, y0, y1, yText) {
  return hourTicks(sc, offsetSec).map(k => {
    const x = n1(sc.x(k.t));
    return `<line class="grid" x1="${x}" y1="${y0}" x2="${x}" y2="${y1}"/><text x="${x}" y="${yText}" text-anchor="middle">${k.label}</text>`;
  }).join('');
}

/** 박명 띠: 낮(tw0) → 시민(tw1) → 항해(tw2) → 천문(tw3) → 밤(바탕) */
function twilightSvg(sc, n) {
  const seg = (a, b, cls) => {
    if (a == null || b == null) return '';
    const x0 = Math.max(0, sc.x(a)), x1 = Math.min(W, sc.x(b));
    return x1 > x0 ? `<rect class="${cls}" x="${n1(x0)}" y="0" width="${n1(x1 - x0)}" height="${PLOT_H}"/>` : '';
  };
  return seg(sc.t0, n.sunset, 'tw0') + seg(n.sunset, n.civilEnd, 'tw1') + seg(n.civilEnd, n.nautEnd, 'tw2') + seg(n.nautEnd, n.astroEnd, 'tw3')
    + seg(n.astroStart, n.nautStart, 'tw3') + seg(n.nautStart, n.civilStart, 'tw2') + seg(n.civilStart, n.sunrise, 'tw1') + seg(n.sunrise, sc.t1, 'tw0');
}

/**
 * 고도 곡선. tracks: [{id, ko, pts:[{t, alt}]}]
 */
export function altitudeChart({ sc, night, tracks, offsetSec }) {
  const placed = [];
  const curves = [], labels = [], dots = [];
  for (const tr of tracks) {
    const vis = tr.pts.filter(p => p.t >= sc.t0 && p.t <= sc.t1);
    const top = vis.reduce((m, p) => (p.alt > m.alt ? p : m), { alt: -99 });
    if (top.alt <= 0) continue;
    const d = tr.pts.map((p, i) => `${i ? 'L' : 'M'}${n1(sc.x(p.t))} ${n1(altY(p.alt))}`).join('');
    const dash = DASH[tr.id] ? ` stroke-dasharray="${DASH[tr.id]}"` : '';
    curves.push(`<path class="curve b-${tr.id}" d="${d}"${dash}/>`);
    dots.push(`<circle class="dot b-${tr.id}" data-body="${tr.id}" r="4.5" cx="-99" cy="-99"/>`);
    // 이름표: 최고점 위. 겹치면 아래로 민다.
    let x = clampN(sc.x(top.t), 14, W - 14), y = Math.max(11, altY(top.alt) - 6);
    for (let k = 0; k < 6 && placed.some(p => Math.abs(p.x - x) < 46 && Math.abs(p.y - y) < 12); k++) y += 12;
    placed.push({ x, y });
    const anchor = x < 40 ? 'start' : x > W - 40 ? 'end' : 'middle';
    labels.push(`<text class="lbl" x="${n1(x)}" y="${n1(y)}" text-anchor="${anchor}">${esc(tr.ko)} ${Math.round(top.alt)}°</text>`);
  }
  return `<svg viewBox="${-GUTTER} 0 ${VB_W} ${PLOT_H + 30}" role="img" aria-label="밤사이 천체 고도 곡선">
<defs><clipPath id="clipAlt"><rect x="0" y="0" width="${W}" height="${PLOT_H}"/></clipPath></defs>
<rect class="tw4" x="0" y="0" width="${W}" height="${PLOT_H}"/>${twilightSvg(sc, night)}
<line class="grid dash" x1="0" y1="${n1(altY(30))}" x2="${W}" y2="${n1(altY(30))}"/><line class="grid dash" x1="0" y1="${n1(altY(60))}" x2="${W}" y2="${n1(altY(60))}"/>
${ticksSvg(sc, offsetSec, 0, PLOT_H, PLOT_H + 20)}
<text class="r" x="-6" y="${n1(altY(30) + 3)}">30°</text><text class="r" x="-6" y="${n1(altY(60) + 3)}">60°</text><text class="r" x="-6" y="${PLOT_H + 3}">지평</text>
<g clip-path="url(#clipAlt)">${curves.join('')}</g>
<line class="horizon" x1="0" y1="${PLOT_H}" x2="${W}" y2="${PLOT_H}"/>
${labels.join('')}
<g class="cursor" visibility="hidden"><line class="cur" x1="0" y1="0" x2="0" y2="${PLOT_H}"/>${dots.join('')}
<rect class="curbox" x="-23" y="2" width="46" height="17" rx="4"/><text class="curtxt" x="0" y="15" text-anchor="middle"></text></g>
</svg>`;
}

const clampN = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/**
 * 기상 띠. rows: [{label, kind:'cloud'|'grade'|'plain', value(h), text?(h), grade?(v)}]
 * hours: [{t, ...}] — 각 칸은 그 시각 앞뒤 30분.
 */
export function bandChart({ sc, hours, rows, offsetSec }) {
  const RH = 24, GAP = 3, half = 1800e3;
  let y = 0;
  const body = rows.map(r => {
    const top = y + (r.gapBefore ? 5 : 0);
    y = top + RH + GAP;
    const cells = hours.map(h => {
      const x0 = clampN(sc.x(h.t - half), 0, W), x1 = clampN(sc.x(h.t + half), 0, W);
      const w = x1 - x0 - 1;
      if (w <= 1) return '';
      const v = r.value(h);
      if (!Number.isFinite(v)) return `<rect class="cell na" x="${n1(x0)}" y="${top}" width="${n1(w)}" height="${RH}"/>`;
      let rect, txt = '';
      if (r.kind === 'cloud') {
        rect = `<rect class="cell cbase" x="${n1(x0)}" y="${top}" width="${n1(w)}" height="${RH}"/><rect class="cell cloud" x="${n1(x0)}" y="${top}" width="${n1(w)}" height="${RH}" fill-opacity="${(clampN(v, 0, 100) / 100).toFixed(2)}"/>`;
      } else {
        const g = r.kind === 'grade' ? r.grade(v) : 'p';
        rect = `<rect class="cell g-${g}" x="${n1(x0)}" y="${top}" width="${n1(w)}" height="${RH}"/>`;
        if (w >= 19) txt = `<text class="v" x="${n1(x0 + w / 2)}" y="${top + 16}">${esc(r.text(v))}</text>`;
      }
      return rect + txt;
    }).join('');
    return `<text class="r" x="-6" y="${top + 16}">${esc(r.label)}</text>${cells}`;
  }).join('');
  const h = y;
  return `<svg viewBox="${-GUTTER} 0 ${VB_W} ${h + 20}" role="img" aria-label="시간별 구름·시상·제트기류">
${body}${ticksSvg(sc, offsetSec, 0, 0, h + 14)}
<g class="cursor" visibility="hidden"><line class="cur" x1="0" y1="0" x2="0" y2="${h - GAP}"/></g>
</svg>`;
}
