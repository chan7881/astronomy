import * as M from './model.js';
import { makeSky, BODIES } from './sky.js';
import { loadForecast, searchPlace } from './api.js';
import * as C from './charts.js';
import * as P from './places.js';

const sky = makeSky(window.Astronomy);
const $ = id => document.getElementById(id);
const H = 3600e3, DAY = 86400e3, NIGHTS = 5;
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const SHAPE = { g: '●', m: '▲', b: '■' };

const state = { place: P.loadPlace(), idx: 0, outer: false, data: null, error: null, view: null, cursor: null };

// ── 시각 표기(관측지 시간대) ──────────────────────────────
const offMs = () => (state.data ? state.data.offsetSec * 1000 : -new Date().getTimezoneOffset() * 60e3);
const local = t => new Date(t + offMs());
const hm = t => (t == null ? '–' : local(t).toISOString().slice(11, 16));
const hh = t => String(local(t).getUTCHours()).padStart(2, '0');
const sign = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
const fx = (v, d = 0) => (Number.isFinite(v) ? v.toFixed(d) : '–');
const tag = g => (g ? `<span class="tag t-${g}">${SHAPE[g]} ${M.GRADE_KO[g]}</span>` : '');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** 밤 번호 0의 현지 정오. 아침 8시 전에는 지난밤을 「오늘 밤」으로 본다. */
function baseNoon() {
  const d = new Date(Date.now() + offMs() - 8 * H);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12) - offMs();
}

// ── 자료 조립 ────────────────────────────────────────────
function buildView() {
  const place = state.place, noon = baseNoon() + state.idx * DAY;
  const night = sky.night(place, noon);
  const t0 = (night.sunset ?? noon + 6 * H) - 20 * 60e3, t1 = (night.sunrise ?? noon + 18 * H) + 20 * 60e3;
  const sc = C.scale(t0, t1);
  const bodies = BODIES.filter(b => state.outer || !b.outer);
  const tracks = bodies.map(b => ({ ...b, pts: sky.track(b.id, place, t0, t1, 10) }));
  const mid = (t0 + t1) / 2;
  const table = bodies.map(b => ({ ...b, ...sky.events(b.id, place, noon), ...sky.facts(b.id, place, mid) }));
  const moon = sky.moon(mid), moonEv = table.find(b => b.id === 'Moon');

  const elev = state.data?.elev ?? place.elev ?? 0;
  const hours = (state.data?.hours ?? []).filter(h => h.t >= t0 - H / 2 && h.t <= t1 + H / 2).map(h => {
    const see = M.seeing(h.levels, h.wind10, elev);
    const mAlt = sky.altAz('Moon', place, h.t).alt;
    const x = { ...h, seeing: see, index: M.seeingIndex(see), jet: M.jetSpeed(h.levels), bad: M.badLayer(h.levels, elev), spread: M.spread(h.temp, h.dew), moonAlt: mAlt, moonFrac: moon.frac };
    x.score = M.hourScore(x);
    return x;
  });
  const darkFrom = night.astroEnd ?? night.sunset ?? t0, darkTo = night.astroStart ?? night.sunrise ?? t1;
  const dark = hours.filter(h => h.t >= darkFrom && h.t <= darkTo);
  return { noon, night, sc, tracks, table, moon, moonEv, hours, dark, summary: M.nightSummary(dark), darkFrom, darkTo };
}

function moonLine(v) {
  const { moon, moonEv, night } = v, a = night.sunset, b = night.sunrise;
  const within = t => t != null && a != null && b != null && t > a && t < b;
  const ev = within(moonEv.set) ? `${hm(moonEv.set)} 짐` : within(moonEv.rise) ? `${hm(moonEv.rise)} 뜸`
    : sky.altAz('Moon', state.place, (v.darkFrom + v.darkTo) / 2).alt > 0 ? '밤새 떠 있음' : '밤새 없음';
  return `${Math.round(moon.frac * 100)}% ${moon.name} · ${ev}`;
}

function cloudLine(n) {
  if (!n) return '–';
  switch (n.kind) {
    case 'clear': return '밤새 맑음';
    case 'overcast': return '밤새 흐림';
    case 'in': return `${hh(n.t)}시부터 ${n.layer} 유입`;
    case 'out': return `${hh(n.t)}시부터 갬`;
    default: return `평균 ${Math.round(n.avg)}%`;
  }
}

// ── 그리기 ───────────────────────────────────────────────
function render() {
  const v = state.view = buildView(), s = v.summary, p = state.place;
  $('place-name').textContent = p.name;
  $('place-sub').textContent = `${P.coordText(p)} · 해발 ${Math.round(state.data?.elev ?? p.elev ?? 0)}m`;
  $('btn-fav').textContent = P.isFavorite(p) ? '저장됨' : '저장';
  $('btn-fav').setAttribute('aria-pressed', P.isFavorite(p));

  const base = baseNoon();
  $('days').innerHTML = Array.from({ length: NIGHTS }, (_, i) => {
    const d = local(base + i * DAY);
    const label = i === 0 ? `오늘 밤<br>${d.getUTCDate()} ${WEEK[d.getUTCDay()]}` : `${d.getUTCDate()}<br>${WEEK[d.getUTCDay()]}`;
    return `<button type="button" data-idx="${i}" aria-pressed="${i === state.idx}">${label}</button>`;
  }).join('');

  // 판정
  $('verdict-card').hidden = !s;
  $('error-card').hidden = !state.error;
  if (state.error) $('error-text').textContent = state.error;
  if (s) {
    $('verdict-title').textContent = state.idx === 0 ? '오늘 밤 판정' : `${local(v.noon).getUTCDate()}일 밤 판정`;
    $('score').className = `score s-${s.grade}`;
    $('score-num').textContent = Math.round(s.score);
    const w = s.window;
    $('brief').innerHTML = [
      ['판정', `${SHAPE[s.grade]} ${M.GRADE_KO[s.grade]}`],
      ['최적 시간', w ? `${hm(w.from)} ~ ${hm(Math.min(w.to, v.darkTo))}` : '없음'],
      ['달', moonLine(v)],
      ['구름', cloudLine(s.cloudNote)],
      ['주의', s.cautions.length ? s.cautions.join(' · ') : '없음'],
    ].map(([k, val]) => `<li><span>${k}</span><b>${esc(val)}</b></li>`).join('');
    $('chips').innerHTML = [
      ['구름(밤 평균)', `${Math.round(s.cloudAvg)}%`, M.gradeCloud(s.cloudAvg)],
      ['시상(추정)', s.seeingAvg == null ? '–' : `${s.seeingAvg.toFixed(1)}″`, M.gradeSeeing(s.seeingAvg)],
      ['제트기류(최대)', s.jetMax == null ? '–' : `${Math.round(s.jetMax)}m/s`, M.gradeJet(s.jetMax)],
      ['이슬점 차(최소)', s.dewMin == null ? '–' : `${s.dewMin.toFixed(1)}℃`, M.gradeDew(s.dewMin)],
    ].map(([k, val, g]) => `<div class="chip">${k}<b>${val} ${tag(g)}</b></div>`).join('');
  }

  // 고도 곡선
  const n = v.night;
  $('sunline').innerHTML = `<span>해짐 <b>${hm(n.sunset)}</b></span><span>천문박명 ${hm(n.astroEnd)} ~ ${hm(n.astroStart)}</span><span>해뜸 <b>${hm(n.sunrise)}</b></span>`;
  $('alt-chart').innerHTML = C.altitudeChart({ sc: v.sc, night: n, tracks: v.tracks, offsetSec: offMs() / 1000 });
  $('legend').innerHTML = v.tracks.map(t => `<span><svg viewBox="0 0 18 6" class="key"><line class="curve b-${t.id}" x1="1" y1="3" x2="17" y2="3"${C.DASH[t.id] ? ` stroke-dasharray="${C.DASH[t.id]}"` : ''}/></svg>${t.ko}</span>`).join('')
    + `<button type="button" id="btn-outer" aria-pressed="${state.outer}">천왕성·해왕성</button>`;
  $('moonline').textContent = `달 ${Math.round(v.moon.frac * 100)}% ${v.moon.name} · 월령 ${v.moon.age.toFixed(1)}일`;

  // 기상 띠
  $('weather-card').hidden = !v.hours.length;
  if (v.hours.length) {
    const r0 = x => String(Math.round(x));
    $('band-chart').innerHTML = C.bandChart({
      sc: v.sc, hours: v.hours, offsetSec: offMs() / 1000, rows: [
        { label: '상층', kind: 'cloud', value: h => h.high },
        { label: '중층', kind: 'cloud', value: h => h.mid },
        { label: '하층', kind: 'cloud', value: h => h.low },
        { label: '시상″', kind: 'grade', value: h => h.seeing, text: x => x.toFixed(1), grade: M.gradeSeeing, gapBefore: true },
        { label: '제트', kind: 'grade', value: h => h.jet, text: r0, grade: M.gradeJet },
        { label: '투명', kind: 'grade', value: h => h.aod, text: x => x.toFixed(2).replace(/^0/, ''), grade: M.gradeAod },
        { label: '이슬차', kind: 'grade', value: h => h.spread, text: x => x.toFixed(0), grade: M.gradeDew },
        { label: '기온', kind: 'plain', value: h => h.temp, text: r0, gapBefore: true },
        { label: '바람', kind: 'plain', value: h => h.wind10, text: r0 },
      ],
    });
    $('detail-body').innerHTML = v.hours.filter(h => h.t >= v.sc.t0 && h.t <= v.sc.t1).map(h => `<tr>
<td>${hh(h.t)}</td><td>${fx(h.low)}</td><td>${fx(h.mid)}</td><td>${fx(h.high)}</td><td>${fx(h.seeing, 1)}</td><td>${fx(h.index)}</td>
<td>${fx(h.jet)}</td><td>${h.bad ? `${h.bad.bot.toFixed(1)}–${h.bad.top.toFixed(1)}` : '–'}</td><td>${h.bad ? h.bad.grad.toFixed(1) : '–'}</td>
<td>${fx(h.temp)}</td><td>${fx(h.rh)}</td></tr>`).join('');
  }

  // 천체 제원
  $('body-rows').innerHTML = v.table.map(b => {
    const diam = b.id === 'Moon' ? `${(b.diam / 60).toFixed(1)}′` : `${b.diam.toFixed(1)}″`;
    return `<tr class="row" data-body="${b.id}" tabindex="0" aria-expanded="false"><td><i class="sw b-${b.id}"></i>${b.ko}</td><td>${hm(b.rise)}</td><td>${hm(b.transit)}</td><td>${hm(b.set)}</td><td>${sign(b.mag)}</td><td>${diam}</td></tr>
<tr class="more" hidden><td colspan="6">남중 고도 ${Math.round(b.transitAlt)}° · 위상 ${Math.round(b.frac * 100)}% · 거리 ${b.id === 'Moon' ? Math.round(b.distAu * 149597870.7).toLocaleString('ko') + 'km' : b.distAu.toFixed(2) + 'AU'} · ${b.constellation}<br>적경 ${raText(b.ra)} · 적위 ${decText(b.dec)}</td></tr>`;
  }).join('');

  $('meteoblue').href = `https://www.meteoblue.com/en/weather/outdoorsports/seeing/${Math.abs(p.lat).toFixed(3)}${p.lat >= 0 ? 'N' : 'S'}${Math.abs(p.lon).toFixed(3)}${p.lon >= 0 ? 'E' : 'W'}`;

  const now = Date.now();
  setCursor(state.cursor && state.cursor >= v.sc.t0 && state.cursor <= v.sc.t1 ? state.cursor
    : now >= v.sc.t0 && now <= v.sc.t1 ? now : (v.summary?.window ? v.summary.window.from : (v.darkFrom + v.darkTo) / 2));
}

function raText(h) { const m = Math.round(h * 60); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`; }
function decText(d) { const m = Math.round(Math.abs(d) * 60); return `${d < 0 ? '−' : '+'}${Math.floor(m / 60)}° ${String(m % 60).padStart(2, '0')}′`; }

// ── 시각 커서: 두 그림과 읽기 줄을 함께 움직인다 ─────────────
function setCursor(t) {
  const v = state.view; if (!v) return;
  state.cursor = t;
  const x = v.sc.x(t).toFixed(1);
  document.querySelectorAll('.cursor').forEach(g => { g.setAttribute('visibility', 'visible'); g.querySelector('.cur').setAttribute('transform', `translate(${x})`); });
  const alt = $('alt-chart');
  const box = Math.min(C.W - 23, Math.max(23, +x));
  alt.querySelector('.curbox')?.setAttribute('transform', `translate(${box})`);
  const txt = alt.querySelector('.curtxt');
  if (txt) { txt.setAttribute('transform', `translate(${box})`); txt.textContent = hm(t); }
  const up = [];
  for (const tr of v.tracks) {
    const pos = sky.altAz(tr.id, state.place, t);
    const dot = alt.querySelector(`.dot[data-body="${tr.id}"]`);
    if (dot) { dot.setAttribute('cx', x); dot.setAttribute('cy', pos.alt > 0 ? C.altY(pos.alt).toFixed(1) : -99); }
    if (pos.alt > 0) up.push(`<span><i class="sw b-${tr.id}"></i>${tr.ko} <b>${Math.round(pos.alt)}°</b> ${M.compass(pos.az)}</span>`);
  }
  $('sky-read').innerHTML = `<b class="time">${hm(t)}</b>` + (up.length ? up.join('') : '<span>지평선 위 천체 없음</span>');
  const h = v.hours.reduce((m, c) => (!m || Math.abs(c.t - t) < Math.abs(m.t - t) ? c : m), null);
  if (h) $('wx-read').innerHTML = `<b class="time">${hh(h.t)}시</b>
<span>구름 하 <b>${fx(h.low)}</b> 중 <b>${fx(h.mid)}</b> 상 <b>${fx(h.high)}</b>%</span><span>시상 <b>${fx(h.seeing, 1)}″</b> 지수 <b>${fx(h.index)}</b></span>
<span>제트 <b>${fx(h.jet)}</b>m/s</span><span>불량층 <b>${h.bad ? `${h.bad.bot.toFixed(1)}–${h.bad.top.toFixed(1)}km` : '없음'}</b></span>
<span>기온 <b>${fx(h.temp, 1)}</b>℃ 이슬점 <b>${fx(h.dew, 1)}</b>℃ 습도 <b>${fx(h.rh)}</b>%</span><span>바람 ${Number.isFinite(h.windDir) ? M.compass(h.windDir) : ''} <b>${fx(h.wind10, 1)}</b>m/s</span>
${h.aod == null ? '' : `<span>에어로졸 <b>${h.aod.toFixed(2)}</b></span>`}`;
}

function bindPlot(el) {
  const move = e => {
    const svg = el.querySelector('svg'); if (!svg || !state.view) return;
    const r = svg.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * (C.W + C.GUTTER) - C.GUTTER;
    setCursor(state.view.sc.t(Math.min(C.W, Math.max(0, x))));
  };
  el.addEventListener('pointerdown', move);
  el.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.buttons) move(e); });
}

// ── 불러오기·이벤트 ──────────────────────────────────────
let loadSeq = 0;
async function load() {
  const seq = ++loadSeq, place = state.place;
  document.body.classList.add('loading');
  let data = null, error = null;
  try { data = await loadForecast(place.lat, place.lon); }
  catch (e) { error = `예보를 불러오지 못했습니다 (${e.message})`; }
  if (seq !== loadSeq) return;            // 그사이 다른 요청이 나갔다 — 늦게 온 답은 버린다
  document.body.classList.remove('loading');
  if (data) state.data = data;            // 실패하면 앞서 받은 예보를 그대로 둔다
  state.error = error;
  render();
}

function choose(place) {
  state.place = place; state.cursor = null; state.idx = 0;
  state.data = null; state.error = null;   // 앞 관측지의 예보를 새 이름 아래 보이지 않게
  P.savePlace(place);
  $('dlg').close();
  render(); load();
}

function placeItem(p, removable) {
  return `<li><button type="button" class="pick" data-place="${esc(JSON.stringify(p))}"><b>${esc(p.name)}</b><small>${esc(p.region || P.coordText(p))}</small></button>${removable ? `<button type="button" class="del" data-place="${esc(JSON.stringify(p))}" aria-label="${esc(p.name)} 삭제">삭제</button>` : ''}</li>`;
}
const drawFavs = () => { $('fav-list').innerHTML = P.loadFavorites().map(p => placeItem(p, true)).join('') || '<li class="empty">저장한 관측지 없음</li>'; };

function init() {
  document.documentElement.dataset.theme = P.loadTheme();
  $('btn-red').setAttribute('aria-pressed', P.loadTheme() === 'red');
  $('btn-red').onclick = () => {
    const t = document.documentElement.dataset.theme === 'red' ? 'dark' : 'red';
    document.documentElement.dataset.theme = t; P.saveTheme(t);
    $('btn-red').setAttribute('aria-pressed', t === 'red');
  };
  $('btn-search').onclick = () => { drawFavs(); $('results').innerHTML = ''; $('dlg').showModal(); $('q').focus(); };
  $('btn-close').onclick = () => $('dlg').close();
  $('btn-fav').onclick = () => { P.toggleFavorite(state.place); render(); };
  $('btn-gps').onclick = async () => {
    $('btn-gps').disabled = true;
    try { const c = await P.locate(); choose({ name: '현재 위치', region: '', lat: c.lat, lon: c.lon, elev: 0 }); }
    catch (e) { state.error = e.message; render(); }
    $('btn-gps').disabled = false;
  };
  $('btn-retry').onclick = load;
  $('search-form').onsubmit = async e => {
    e.preventDefault();
    const q = $('q').value.trim(); if (!q) return;
    const c = P.parseCoords(q);
    if (c) { $('results').innerHTML = placeItem({ name: '지정 좌표', region: '', lat: c.lat, lon: c.lon, elev: 0 }, false); return; }
    $('results').innerHTML = '<li class="empty">찾는 중</li>';
    try {
      const r = await searchPlace(q);
      $('results').innerHTML = r.map(p => placeItem(p, false)).join('') || '<li class="empty">결과 없음</li>';
    } catch { $('results').innerHTML = '<li class="empty">검색하지 못했습니다</li>'; }
  };
  $('dlg').addEventListener('click', e => {
    const b = e.target.closest('button[data-place]'); if (!b) return;
    const p = JSON.parse(b.dataset.place);
    if (b.classList.contains('del')) { P.toggleFavorite(p); drawFavs(); render(); } else choose(p);
  });
  $('days').addEventListener('click', e => {
    const b = e.target.closest('button[data-idx]'); if (!b) return;
    state.idx = +b.dataset.idx; state.cursor = null; render();
  });
  $('legend').addEventListener('click', e => { if (e.target.id === 'btn-outer') { state.outer = !state.outer; render(); } });
  const toggleRow = tr => { const more = tr.nextElementSibling; more.hidden = !more.hidden; tr.setAttribute('aria-expanded', !more.hidden); };
  $('body-rows').addEventListener('click', e => { const tr = e.target.closest('tr.row'); if (tr) toggleRow(tr); });
  $('body-rows').addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr.row')) { e.preventDefault(); toggleRow(e.target); } });
  bindPlot($('alt-chart')); bindPlot($('band-chart'));
  render(); load();
  setInterval(() => { if (!document.hidden) load(); }, 15 * 60e3);
}

init();
