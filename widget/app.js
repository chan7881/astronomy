// Scriptable에서 도는 부분: 자료 받기 · 그리기 명령을 DrawContext로 옮기기 · 위젯 내놓기.
// 계산과 배치는 data.js·layout.js에 있고 여기서는 Scriptable API만 다룬다.
/* global Astronomy, config, args, Script, Request, FileManager, ListWidget, DrawContext, Size, Rect, Point, Path, Color, Font, Timer, Location */
import { makeSky } from '../js/sky.js';
import { forecastUrl, airUrl, normalize } from '../js/api.js';
import { widgetModel } from './data.js';
import { layout, lockText, lockCircle } from './layout.js';
import { parseParam, roundHere, hereName } from './param.js';
import { DEFAULT_PLACE } from '../js/places.js';

const SITE = 'https://chan7881.github.io/astronomy/';
const TTL = 30 * 60e3;

// 여러 위젯이 한꺼번에 새로 고칠 때 저마다 예보를 받으면 시간·메모리를 나눠 쓰다 시간 초과가 난다.
// 그래서 받는 중 표시(.lock)를 두고, 다른 위젯이 받는 중이면 직접 받지 않고 예전 것이나 그 결과를 쓴다.
const LOCK_MS = 20e3, WAIT_MS = 8e3, FETCH_TIMEOUT = 8, OLD_OK = 6 * 3600e3, SOON = 5 * 60e3;
const sleep = ms => new Promise(r => Timer.schedule(ms, false, r));

/**
 * 예보를 받는다. 30분 안에 받은 것이 있으면 그것을, 못 받으면 예전 것이라도 쓴다.
 * 반환 {data(없으면 null), soon(true면 새 예보가 아니니 5분 뒤에 다시 고친다)}
 */
async function loadData(place) {
  const fm = FileManager.local();
  const base = fm.joinPath(fm.cacheDirectory(), `astro-${place.lat.toFixed(3)}_${place.lon.toFixed(3)}`);
  const path = base + '.json', lock = base + '.lock';
  const read = () => { try { return fm.fileExists(path) ? JSON.parse(fm.readString(path)) : null; } catch (e) { return null; } };
  const busy = () => { try { const t = fm.fileExists(lock) ? Number(fm.readString(lock)) : 0; return Date.now() - t < LOCK_MS; } catch (e) { return false; } };
  const age = c => (c ? Date.now() - c.at : Infinity);
  const out = (c, soon) => ({ data: c ? normalize(c.fc, c.air) : null, soon });
  let old = read();
  if (age(old) < TTL) return out(old, false);
  if (busy()) {
    // 다른 위젯이 받는 중 — 몇 시간 안의 예전 것이면 바로 쓰고, 아니면 그 위젯이 끝나기를 기다린다
    if (age(old) < OLD_OK) return out(old, true);
    for (let t = 0; t < WAIT_MS && busy(); t += 500) {
      await sleep(500);
      const c = read();
      if (age(c) < TTL) return out(c, false);
    }
    if (busy()) return out(old, true);   // 아직도 받는 중 — 겹쳐 받지 않는다
    old = read();
    if (age(old) < TTL) return out(old, false);
  }
  const mine = String(Date.now());
  try { fm.writeString(lock, mine); } catch (e) { /* 표시는 없어도 된다 */ }
  try {
    const q = new Request(forecastUrl(place.lat, place.lon)); q.timeoutInterval = FETCH_TIMEOUT;
    const fc = await q.loadJSON();
    if (!fc || !fc.hourly) throw new Error('예보 응답이 비었다');
    let air = null;
    try {
      const r = new Request(airUrl(place.lat, place.lon)); r.timeoutInterval = FETCH_TIMEOUT / 2;
      air = await r.loadJSON(); if (!air || !air.hourly) air = null;
    } catch (e) { air = null; }
    try { fm.writeString(path, JSON.stringify({ at: Date.now(), fc, air })); } catch (e) { /* 캐시는 없어도 된다 */ }
    return out({ fc, air }, false);
  } catch (e) {
    return out(old || read(), true);
  } finally {
    // 내가 쓴 표시일 때만 지운다(그사이 다른 위젯이 덮어썼으면 그쪽 것이다)
    try { if (fm.fileExists(lock) && fm.readString(lock) === mine) fm.remove(lock); } catch (e) { /* 남아도 LOCK_MS 뒤엔 무시된다 */ }
  }
}

// 내 위치: 10분 안에 다른 위젯이 읽은 것이 있으면 그것을 쓴다(한꺼번에 깨어날 때 위치를 여러 번 묻지 않게).
// 위젯 안에서는 위치 읽기가 늦거나 실패할 수 있어 3km 정밀도·5초 제한으로 묻고, 못 읽으면 마지막 위치, 그것도 없으면 포항.
const HERE_FRESH = 10 * 60e3, HERE_WAIT = 5e3, GEO_WAIT = 3e3;
const within = (p, ms) => Promise.race([p, sleep(ms).then(() => null)]);
export async function resolveHere(place) {
  const fm = FileManager.local(), path = fm.joinPath(fm.cacheDirectory(), 'astro-here.json');
  let saved = null;
  try { if (fm.fileExists(path)) saved = JSON.parse(fm.readString(path)); } catch (e) { saved = null; }
  if (!saved || !Number.isFinite(saved.lat) || !Number.isFinite(saved.lon) || !Number.isFinite(saved.at)) saved = null;   // 깨진 저장본
  const use = h => ({ ...place, lat: h.lat, lon: h.lon, name: place.custom ? place.name : h.name || '내 위치' });
  if (saved && Date.now() - saved.at < HERE_FRESH) return use(saved);
  let pos = null;
  try { Location.setAccuracyToThreeKilometers(); pos = await within(Location.current(), HERE_WAIT); } catch (e) { pos = null; }
  if (!pos || !Number.isFinite(pos.latitude)) return saved ? use(saved) : { ...DEFAULT_PLACE };
  const lat = roundHere(pos.latitude), lon = roundHere(pos.longitude);
  let name = saved && saved.lat === lat && saved.lon === lon ? saved.name : null;   // 그대로면 지명을 다시 묻지 않는다
  if (!name) { try { const g = await within(Location.reverseGeocode(lat, lon, 'ko_KR'), GEO_WAIT); name = hereName(g && g[0]); } catch (e) { name = null; } }
  const h = { at: Date.now(), lat, lon, name };   // 지명을 못 찾았으면 비워 두어 다음에 다시 묻는다
  try { fm.writeString(path, JSON.stringify(h)); } catch (e) { /* 없어도 된다 */ }
  return use(h);
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
  // 칸을 넘으면 iOS가 0.6배까지 줄인다(홈 화면 위젯의 fit과 같은 유동 글자 크기)
  const t = w.addText(L.title); t.font = Font.boldSystemFont(13); t.lineLimit = 1; t.minimumScaleFactor = 0.6;
  for (const s of L.lines) { const x = w.addText(s); x.font = Font.systemFont(12); x.lineLimit = 1; x.minimumScaleFactor = 0.6; }
  return w;
}

export async function run() {
  const family = config.widgetFamily || 'large';
  // 「진단」은 예전 임시 설정값 — 남아 있어도 지명으로 읽지 않는다
  const param = String(args.widgetParameter ?? '').replace(/진단/g, '');
  const { kind, place: asked, glass } = parseParam(param, family);
  const place = asked.here ? await resolveHere(asked) : asked;
  const { data, soon } = await loadData(place);
  const model = widgetModel(makeSky(Astronomy), place, data, Date.now());
  let w;
  if (family.startsWith('accessory')) w = lockWidget(family, kind, model);
  else {
    w = new ListWidget();
    w.setPadding(0, 0, 0, 0);
    w.backgroundImage = paint(layout(kind, model, { glass }), true);
  }
  w.url = SITE;
  // 위젯마다(크기·설정값) 다시 고칠 때를 0~5분 어긋나게 둔다 — 한꺼번에 깨어나는 일을 줄인다
  let hsh = 0; for (const ch of family + param) hsh = (hsh * 31 + ch.charCodeAt(0)) % 301;
  w.refreshAfterDate = new Date(Date.now() + (soon ? SOON : TTL) + hsh * 1e3);
  if (config.runsInWidget) Script.setWidget(w);
  else if (family === 'small') await w.presentSmall();
  else if (family === 'medium') await w.presentMedium();
  else await w.presentLarge();
  Script.complete();
}
