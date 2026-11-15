import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/model.js';

// 표준 대기 비슷한 기압면 묶음. lapse(K/km)와 바람을 바꿔 가며 쓴다.
const P = [1000, 925, 850, 700, 600, 500, 400, 300, 250, 200];
const Z = [100, 760, 1460, 3010, 4200, 5570, 7180, 9160, 10360, 11780];
function column({ lapse = 6.5, t0 = 15, wind = () => 10, dir = () => 270 } = {}) {
  return P.map((p, i) => ({ p, z: Z[i], T: t0 - lapse * (Z[i] - Z[0]) / 1000, ws: wind(Z[i]), wd: dir(Z[i]) }));
}
const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b} (±${tol})`);

test('온위: 1000hPa에서는 절대온도와 같고, 같은 기온이면 기압이 낮을수록 크다', () => {
  near(M.theta(0, 1000), 273.15, 1e-9);
  assert.ok(M.theta(0, 500) > M.theta(0, 1000));
});

test('층 기울기 부호: 등온층은 +, 건조단열(9.8K/km)은 0에 가깝고, 초단열은 −', () => {
  const g = lapse => M.layers(column({ lapse }))[2].grad;
  assert.ok(g(0) > 0.9, `등온 ${g(0)}`);
  near(g(9.8), 0, 0.06);
  assert.ok(g(12) < 0);
  near(g(6.5), 0.36, 0.08);   // 표준 대기는 약 0.36K/100m
});

test('지면 아래 기압면은 버린다', () => {
  assert.equal(M.layers(column(), 1000).length, P.length - 1 - 2);
});

test('바람 시어: 방향이 반대면 속도 차가 아니라 합으로 잡힌다', () => {
  const same = M.layers(column({ wind: () => 10 }))[0].shear;
  const opposite = M.layers(column({ wind: () => 10, dir: z => (z < 500 ? 90 : 270) }))[0].shear;
  near(same, 0, 1e-12);
  near(opposite, 20 / (Z[1] - Z[0]), 1e-9);
});

test('불량층: 역전층의 아래·위 고도와 기울기를 찾는다', () => {
  const lv = column();
  assert.equal(M.badLayer(lv), null);            // 표준 대기는 0.5 미만
  lv[4].T = lv[3].T + 2;                          // 700→600hPa 역전
  const b = M.badLayer(lv);
  near(b.bot, 3.01, 1e-9); near(b.top, 4.2, 1e-9);
  assert.ok(b.grad > 0.5);
});

test('불량층: 성층권(200hPa 위)은 세지 않는다', () => {
  const lv = [...column(), { p: 150, z: 13600, T: -56, ws: 10, wd: 270 }, { p: 100, z: 16200, T: -56, ws: 10, wd: 270 }];
  assert.equal(M.badLayer(lv), null);
});

test('제트기류: 300~200hPa 최댓값만 본다', () => {
  const lv = column({ wind: z => (z > 9000 && z < 10000 ? 45 : z < 2000 ? 60 : 20) });
  assert.equal(M.jetSpeed(lv), 45);
});

test('시상: 시어가 커지면 나빠진다', () => {
  const calm = M.freeSeeing(column({ wind: () => 10 }));
  const sheared = M.freeSeeing(column({ wind: z => 5 + z / 250 }));
  assert.ok(sheared > calm * 1.2, `${sheared} vs ${calm}`);
});

test('시상: 안정도(온위 기울기)가 커지면 나빠지고, 건조단열이면 0에 가깝다', () => {
  const std = M.freeSeeing(column({ lapse: 6.5 })), stable = M.freeSeeing(column({ lapse: 3 }));
  assert.ok(stable > std * 1.5, `${stable} vs ${std}`);
  assert.ok(M.freeSeeing(column({ lapse: 9.8 })) < std * 0.25);   // 시험용 고도가 정역학과 딱 맞지는 않아 0은 아니다
});

test('시상: 표준 대기의 값이 현실 범위(0.1~3″)에 든다', () => {
  const s = M.freeSeeing(column({ wind: z => 5 + z / 400 }));
  assert.ok(s > 0.1 && s < 3, String(s));
});

test('시상: 지상풍이 세지면 나빠지고, 전체는 두 성분보다 작지 않다', () => {
  const lv = column();
  assert.ok(M.seeing(lv, 10) > M.seeing(lv, 0));
  assert.ok(M.seeing(lv, 3) >= Math.max(M.freeSeeing(lv), M.groundSeeing(3)));
});

test('시상 지수: 작을수록(좋을수록) 5에 가깝다', () => {
  assert.deepEqual([0.8, 1.2, 1.7, 2.5, 3.5].map(M.seeingIndex), [5, 4, 3, 2, 1]);
});

test('등급 경계', () => {
  assert.deepEqual([20, 20.1, 30, 30.1].map(M.gradeJet), ['g', 'm', 'm', 'b']);
  assert.deepEqual([1.4, 1.5, 2.2].map(M.gradeSeeing), ['g', 'm', 'b']);
  assert.deepEqual([4, 2, 1.9].map(M.gradeDew), ['g', 'm', 'b']);
  assert.equal(M.gradeJet(null), null);
});

test('관측 점수: 구름·시상·달·먼지가 늘면 내려가고, 구름 100%면 0', () => {
  const base = { cloud: 10, seeing: 1.2, aod: 0.1, moonAlt: -10, moonFrac: 0.9 };
  const s = M.hourScore(base);
  assert.ok(M.hourScore({ ...base, cloud: 60 }) < s);
  assert.ok(M.hourScore({ ...base, seeing: 2.5 }) < s);
  assert.ok(M.hourScore({ ...base, moonAlt: 40 }) < s);
  assert.ok(M.hourScore({ ...base, aod: 0.4 }) < s);
  assert.equal(M.hourScore({ ...base, moonAlt: 40, moonFrac: 0 }), s);   // 삭이면 달이 떠도 같다
  assert.equal(M.hourScore({ ...base, cloud: 100 }), 0);
  assert.ok(s > 80 && s <= 100);
});

test('최적 구간: 최고점을 포함한 연속 구간, 끝은 마지막 칸의 끝', () => {
  const t = i => i * 3600e3;
  const hours = [30, 80, 90, 85, 40, 88].map((score, i) => ({ t: t(i), score }));
  assert.deepEqual(M.bestWindow(hours), { from: t(1), to: t(4), peak: 90 });
  assert.equal(M.bestWindow([{ t: 0, score: 39 }]), null);
});

test('구름 한 줄: 맑음·흐림·유입·갬', () => {
  const mk = arr => arr.map((c, i) => ({ t: i, cloud: c, low: c, mid: 0, high: 0 }));
  assert.equal(M.cloudNote(mk([0, 10, 20])).kind, 'clear');
  assert.equal(M.cloudNote(mk([90, 100, 80])).kind, 'overcast');
  assert.deepEqual((({ kind, t, layer }) => ({ kind, t, layer }))(M.cloudNote(mk([10, 30, 70, 90]))), { kind: 'in', t: 2, layer: '하층운' });
  assert.equal(M.cloudNote(mk([90, 60, 20, 10])).kind, 'out');
});

test('밤 요약: 주의 항목', () => {
  const h = { t: 0, cloud: 0, low: 0, mid: 0, high: 0, seeing: 1, jet: 35, temp: 5, dew: 4, wind10: 2, gust: 3, precipProb: 0, aod: 0.1, score: 90 };
  const s = M.nightSummary([h]);
  assert.deepEqual(s.cautions, ['결로', '제트기류 강함']);
  assert.equal(s.grade, 'g');
  assert.deepEqual(M.nightSummary([{ ...h, jet: 10, dew: 0, precipProb: 60, gust: 15 }]).cautions, ['강수', '강풍']);
});

test('달 위상 이름', () => {
  assert.deepEqual([0, 45, 90, 135, 180, 225, 270, 315, 358].map(M.moonPhaseName),
    ['삭', '초승달', '상현달', '차오르는 달', '보름달', '기우는 달', '하현달', '그믐달', '삭']);
});

test('시직경·방위', () => {
  near(M.angularDiameter(1737.4, 384400 / 149597870.7) / 60, 31.07, 0.05);   // 달 약 31′
  assert.deepEqual([0, 90, 180, 270, 350, 202.5].map(M.compass), ['북', '동', '남', '서', '북', '남남서']);
});

test('빠진 자료: 상층이 없으면 시상은 null, 바람이 빠진 면은 시어를 만들지 않고, 이슬점이 없으면 차도 null', () => {
  assert.equal(M.freeSeeing([]), null);
  assert.equal(M.seeing([], 3), null);
  assert.equal(M.seeingIndex(null), null);
  const lv = column({ wind: () => 40 });
  const full = M.freeSeeing(lv);
  lv[8].ws = null;
  near(M.freeSeeing(lv), full, 1e-9);
  assert.equal(M.spread(1.5, null), null);
  assert.equal(M.spread(5, 3), 2);
  const h = { t: 0, cloud: 0, low: 0, mid: 0, high: 0, seeing: null, jet: null, temp: 1.5, dew: null, score: 50 };
  const s = M.nightSummary([h]);
  assert.deepEqual([s.dewMin, s.jetMax, s.seeingAvg, s.cautions], [null, null, null, []]);
});
