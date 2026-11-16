// Scriptable에서 도는 부분: 자료 받기 · 그리기 명령을 DrawContext로 옮기기 · 위젯 내놓기.
// 계산과 배치는 data.js·layout.js에 있고 여기서는 Scriptable API만 다룬다.
/* global Astronomy, config, args, Script, Request, FileManager, ListWidget, DrawContext, Size, Rect, Point, Path, Color, Font */
import { makeSky } from '../js/sky.js';
import { forecastUrl, airUrl, normalize } from '../js/api.js';
import { widgetModel } from './data.js';
import { layout, lockText, lockCircle } from './layout.js';
import { parseParam } from './param.js';

const SITE = 'https://chan7881.github.io/astronomy/';
const TTL = 30 * 60e3;

/** 예보를 받는다. 30분 안에 받은 것이 있으면 그것을, 못 받으면 예전 것이라도 쓴다. 아무것도 없으면 null */
async function loadData(place) {
  const fm = FileManager.local();
  const path = fm.joinPath(fm.cacheDirectory(), `astro-${place.lat.toFixed(3)}_${place.lon.toFixed(3)}.json`);
  let old = null;
  try { if (fm.fileExists(path)) old = JSON.parse(fm.readString(path)); } catch (e) { old = null; }
  if (old && Date.now() - old.at < TTL) return normalize(old.fc, old.air);
  try {
    const fc = await new Request(forecastUrl(place.lat, place.lon)).loadJSON();
    if (!fc || !fc.hourly) throw new Error('예보 응답이 비었다');
    let air = null;
    try { air = await new Request(airUrl(place.lat, place.lon)).loadJSON(); if (!air || !air.hourly) air = null; } catch (e) { air = null; }
    try { fm.writeString(path, JSON.stringify({ at: Date.now(), fc, air })); } catch (e) { /* 캐시는 없어도 된다 */ }
    return normalize(fc, air);
  } catch (e) {
    return old ? normalize(old.fc, old.air) : null;
  }
}

// '#rrggbb' 또는 '#rrggbbaa'
const col = (hex, a = 1) => (hex.length === 9 ? new Color(hex.slice(0, 7), a * parseInt(hex.slice(7), 16) / 255) : new Color(hex, a));

const FONT = { m: s => Font.mediumSystemFont(s), b: s => Font.boldSystemFont(s), h: s => Font.heavySystemFont(s) };

function trace(o) {
  const p = new Path();
  if (o.op === 'rect') {
    const r = Math.min(o.r, o.w / 2, o.h / 2), box = new Rect(o.x, o.y, o.w, o.h);
    if (r > 0) p.addRoundedRect(box, r, r); else p.addRect(box);
  } else if (o.op === 'circle') p.addEllipse(new Rect(o.cx - o.r, o.cy - o.r, o.r * 2, o.r * 2));
  else if (o.op === 'line') { p.move(new Point(o.x1, o.y1)); p.addLine(new Point(o.x2, o.y2)); }
  else {
    p.move(new Point(o.pts[0][0], o.pts[0][1]));
    for (let i = 1; i < o.pts.length; i++) p.addLine(new Point(o.pts[i][0], o.pts[i][1]));
    if (o.close) p.closeSubpath();
  }
  return p;
}

/** 그리기 명령 → Image */
function paint({ w, h, ops }, opaque) {
  const d = new DrawContext();
  d.size = new Size(w, h); d.opaque = opaque; d.respectScreenScale = true;
  for (const o of ops) {
    if (o.op === 'text') {
      const BIG = 400, x = o.align === 'l' ? o.x : o.align === 'c' ? o.x - BIG / 2 : o.x - BIG;
      d.setFont(FONT[o.weight](o.size)); d.setTextColor(col(o.color));
      if (o.align === 'l') d.setTextAlignedLeft(); else if (o.align === 'c') d.setTextAlignedCenter(); else d.setTextAlignedRight();
      d.drawTextInRect(o.text, new Rect(x, o.y, BIG, o.size * 1.4));
      continue;
    }
    if (o.op === 'rect' && !(o.w > 0 && o.h > 0)) continue;
    const a = o.alpha == null ? 1 : o.alpha;
    if (o.op === 'line') { d.addPath(trace(o)); d.setStrokeColor(col(o.color)); d.setLineWidth(o.sw); d.strokePath(); continue; }
    if (o.fill) { d.addPath(trace(o)); d.setFillColor(col(o.fill, a)); d.fillPath(); }
    if (o.stroke) { d.addPath(trace(o)); d.setStrokeColor(col(o.stroke, a)); d.setLineWidth(o.sw == null ? 1 : o.sw); d.strokePath(); }
  }
  return d.getImage();
}

function lockWidget(family, kind, model) {
  const w = new ListWidget(), L = lockText(model);
  if (family === 'accessoryInline') { w.addText(L.inline); return w; }
  w.addAccessoryWidgetBackground = true;
  if (family === 'accessoryCircular') {
    w.setPadding(0, 0, 0, 0);
    w.addImage(paint(lockCircle(kind, model), false)).centerAlignImage();
    return w;
  }
  const t = w.addText(L.title); t.font = Font.boldSystemFont(13); t.lineLimit = 1;
  for (const s of L.lines) { const x = w.addText(s); x.font = Font.systemFont(12); x.lineLimit = 1; }
  return w;
}

export async function run() {
  const family = config.widgetFamily || 'large';
  const { kind, place, glass } = parseParam(args.widgetParameter, family);
  const data = await loadData(place);
  const model = widgetModel(makeSky(Astronomy), place, data, Date.now());
  let w;
  if (family.startsWith('accessory')) w = lockWidget(family, kind, model);
  else {
    w = new ListWidget();
    w.setPadding(0, 0, 0, 0);
    w.backgroundImage = paint(layout(kind, model, { glass }), true);
  }
  w.url = SITE;
  w.refreshAfterDate = new Date(Date.now() + TTL);
  if (config.runsInWidget) Script.setWidget(w);
  else if (family === 'small') await w.presentSmall();
  else if (family === 'medium') await w.presentMedium();
  else await w.presentLarge();
  Script.complete();
}
