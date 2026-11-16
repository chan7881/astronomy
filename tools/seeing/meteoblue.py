# meteoblue 방식의 재료를 하나씩, 그리고 Dewan 식에 더해 시험한다(docs/시상보정.md 3.5).
# 사용: python meteoblue.py feat.csv   (meteoblue.mjs 결과)
import sys, numpy as np, pandas as pd
from scipy import stats
def load(f):
    d = pd.read_csv(f).dropna(subset=['free_obs','dimm_obs','dewan'])
    d = d[(d.free_obs>0.05)&(d.dimm_obs>0.1)&(d.dimm_obs<5)].copy()
    t = pd.to_datetime(d.hour)
    d['year'] = t.dt.year; d['night'] = (t - pd.Timedelta(hours=16)).dt.date
    d['jetU'] = ((d.ws200<5)|(d.ws200>35)).astype(float)
    return d

d = load(sys.argv[1])
F = ['dewan', 'bad_n', 'bad_dth', 'cat_n', 'cap_b', 'jet', 'jetU']
for trY, teY in [(2023, 2024), (2024, 2023)]:
    tr, te = d[d.year == trY], d[d.year == teY]
    g = te.groupby('night'); ok = g.size() >= 4; nt = g.median(numeric_only=True)[ok]
    print(f'== {trY}로 맞추고 {teY}로 검증 · 밤 {len(nt)}')
    for c in F:
        print(f'  {c:8s} 밤 순위 상관 {stats.spearmanr(nt[c], nt.free_obs, nan_policy="omit")[0]:.3f}')
    # 사이트 식의 형태: log(free/dewan) = a + c·R
    (a, c), *_ = np.linalg.lstsq(np.column_stack([np.ones(len(tr)), tr.cap_b]), np.log(tr.free_obs / tr.dewan), rcond=None)
    k = np.median(tr.free_obs / (tr.dewan * np.exp(c * (tr.cap_b - 2))))
    print(f'  맞춘 값: 배율 {k:.3f} · 계수 {c:.3f}')
    for nm, f in [('× 0.85', 0.85 * te.dewan), ('리처드슨 배율', k * te.dewan * np.exp(c * (te.cap_b - 2)))] + ([('사이트 코드', te.free_site)] if 'free_site' in te else []):
        m = te.assign(f=f).groupby('night').median(numeric_only=True)[ok]
        hi = m.free_obs > m.free_obs.median()
        auc = stats.mannwhitneyu(m.f[hi], m.f[~hi]).statistic / (hi.sum() * (~hi).sum())
        print(f'  {nm:10s} 밤 상관 {stats.spearmanr(m.f, m.free_obs)[0]:.3f} · AUC {auc:.3f} · 치우침 {np.mean(f - te.free_obs):+.3f} · 평균 절대 오차 {np.mean(abs(f - te.free_obs)):.3f}')
