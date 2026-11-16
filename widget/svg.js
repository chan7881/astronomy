// 그리기 명령 → SVG 문자열. PC에서 미리 보고 검사하는 데 쓴다(폰에서는 app.js의 paint가 같은 명령을 그린다).
const WEIGHT = { m: 500, b: 700, h: 900 }, ANCHOR = { l: 'start', c: 'middle', r: 'end' };
const n = v => +v.toFixed(2);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const paint = o => (o.fill ? ` fill="${o.fill}"` : ' fill="none"')
  + (o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 1}" stroke-linejoin="round" stroke-linecap="round"` : '')
  + (o.alpha != null ? ` opacity="${n(o.alpha)}"` : '');

export function toSvg({ w, h, ops }, { radius = 22, id = 'w' } = {}) {
  const body = ops.map(o => {
    switch (o.op) {
      case 'rect': return o.w > 0 && o.h > 0 ? `<rect x="${n(o.x)}" y="${n(o.y)}" width="${n(o.w)}" height="${n(o.h)}" rx="${n(Math.min(o.r, o.w / 2, o.h / 2))}"${paint(o)}/>` : '';
      case 'line': return `<line x1="${n(o.x1)}" y1="${n(o.y1)}" x2="${n(o.x2)}" y2="${n(o.y2)}" stroke="${o.color}" stroke-width="${o.sw}"/>`;
      case 'poly': return `<${o.close ? 'polygon' : 'polyline'} points="${o.pts.map(p => `${n(p[0])},${n(p[1])}`).join(' ')}"${paint(o)}/>`;
      case 'circle': return `<circle cx="${n(o.cx)}" cy="${n(o.cy)}" r="${n(o.r)}"${paint(o)}/>`;
      case 'text': return `<text x="${n(o.x)}" y="${n(o.y + o.size * 0.95)}" font-size="${o.size}" font-weight="${WEIGHT[o.weight]}" fill="${o.color}" text-anchor="${ANCHOR[o.align]}">${esc(o.text)}</text>`;
      default: throw new Error('모르는 명령 ' + o.op);
    }
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><clipPath id="${id}"><rect width="${w}" height="${h}" rx="${radius}"/></clipPath><g clip-path="url(#${id})">${body}</g></svg>`;
}
