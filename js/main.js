import * as M from './model.js';
import { makeSky } from './sky.js';
import { loadForecast, lastForecast, searchPlace, reversePlace } from './api.js';
import * as C from './charts.js';
import * as P from './places.js';
import * as V from './view.js';

const sky = makeSky(window.Astronomy);
const $ = id => document.getElementById(id);
const DAY = 86400e3, NIGHTS = 5;
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const SHAPE = { g: '●', m: '▲', b: '■' };

const state = { place: P.loadPlace(), idx: 0, outer: false, data: null, error: null, view: null, cursor: null };

// ── 시각 표기(관측지 시간대) ──────────────────────────────
const offMs = () => (state.data ? state.data.offsetSec * 1000 : -new Date().getTimezoneOffset() * 60e3);
const local = t => V.clock(offMs()).local(t);
const hm = t => V.clock(offMs()).hm(t);
const hh = t => V.clock(offMs()).hh(t);
const sign = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
const fx = (v, d = 0) => (Number.isFinite(v) ? v.toFixed(d) : '–');
const tag = g => (g ? `<span class="tag t-${g}">${SHAPE[g]} ${M.GRADE_KO[g]}</span>` : '');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const baseNoon = () => V.baseNoon(Date.now(), offMs());

// ── 자료 조립 ────────────────────────────────────────────
function buildView() {
  const v = V.nightView(sky, state.place, state.data, baseNoon() + state.idx * DAY, { outer: state.outer });
  return { ...v, sc: C.scale(v.t0, v.t1) };
}

const moonLine = v => V.moonLine(sky, state.place, v, hm);
const cloudLine = n => V.cloudLine(n, hh);

// ── 그리기 ───────────────────────────────────────────────
function render() {
  const v = state.view = buildView(), s = v.summary, p = state.place;
  $('place-name').textContent = p.name;
  $('place-sub').textContent = `${p.region ? p.region + ' · ' : ''}${P.coordText(p)} · 해발 ${Math.round(state.data?.elev ?? p.elev ?? 0)}m`;
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
  $('weather-card').hidden = !v.day.length; // hours는 day의 부분집합
  if (!v.hours.length) { $('band-chart').innerHTML = ''; $('wx-read').innerHTML = ''; } // 이전 밤의 띠가 남지 않게
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
  }
  // 시간별 상세 표: 그날 정오부터 다음 날 정오까지, 기상 띠와 같은 칠
  const td = C.detailCell, cloud = x => td(fx(x), { kind: 'cloud', value: x });
  $('detail-body').innerHTML = v.day.map(h => {
    const gs = { kind: 'grade', grade: M.gradeSeeing(h.seeing) };
    return `<tr><td>${hh(h.t)}</td>${cloud(h.low)}${cloud(h.mid)}${cloud(h.high)}${td(fx(h.seeing, 1), gs)}${td(fx(h.index), gs)}`
      + td(fx(h.jet), { kind: 'grade', grade: M.gradeJet(h.jet) })
      + `<td>${h.bad ? `${h.bad.bot.toFixed(1)}–${h.bad.top.toFixed(1)}` : '–'}</td><td>${h.bad ? h.bad.grad.toFixed(1) : '–'}</td>
<td>${fx(h.temp)}</td><td>${fx(h.rh)}</td></tr>`;
  }).join('');

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
let loadSeq = 0, retry = null;
const RETRY_MS = 60e3;
async function load() {
  const seq = ++loadSeq, place = state.place;
  clearTimeout(retry);
  document.body.classList.add('loading');
  let data = null, error = null;
  try { data = await loadForecast(place.lat, place.lon); }
  catch (e) { error = `예보를 불러오지 못했습니다 (${e.name === 'TimeoutError' || e.name === 'AbortError' ? '응답 없음' : e.message})`; }
  if (seq !== loadSeq) return;            // 그사이 다른 요청이 나갔다 — 늦게 온 답은 버린다
  document.body.classList.remove('loading');
  if (data) { state.data = data; state.dataAt = Date.now(); }   // 실패하면 앞서 받은 예보를 그대로 둔다
  else if (!state.data) {                 // 앞서 받은 것이 없으면 지난번에 저장한 예보
    const last = lastForecast(place.lat, place.lon);
    if (last) { state.data = last.data; state.dataAt = last.at; }
  }
  if (error && state.data) error += ` · ${V.clock(state.data.offsetSec * 1000).hm(state.dataAt)}에 받은 예보`;   // 재시도가 실패해도 계속 적는다
  state.error = error;
  if (error) retry = setTimeout(() => { if (!document.hidden) load(); }, RETRY_MS);   // 장애가 풀리면 저절로 돌아온다
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
  $('btn-score-info').onclick = () => {
    const open = $('score-info').hidden;
    $('score-info').hidden = !open; $('btn-score-info').setAttribute('aria-expanded', open);
  };
  $('btn-search').onclick = () => { drawFavs(); $('results').innerHTML = ''; $('dlg').showModal(); $('q').focus(); };
  $('btn-close').onclick = () => $('dlg').close();
  $('btn-fav').onclick = () => { P.toggleFavorite(state.place); render(); };
  $('btn-gps').onclick = async () => {
    $('btn-gps').disabled = true;
    try {
      const c = await P.locate(), near = await reversePlace(c.lat, c.lon).catch(() => null);
      choose({ name: near ? near.name : '현재 위치', region: near ? near.region : '', lat: c.lat, lon: c.lon, elev: 0 });
    }
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
  document.addEventListener('visibilitychange', () => { if (!document.hidden && state.error) load(); });   // 폰에서 다시 열면 바로 재시도
}

init();
