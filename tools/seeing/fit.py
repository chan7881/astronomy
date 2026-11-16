# 짝지은 자료로 현재 식 점검 → 2023년으로 보정 → 2024년으로 검증.
import sys, json
import numpy as np, pandas as pd
from scipy import stats

d = pd.read_csv(sys.argv[1])
d['year'] = d.hour.str[:4].astype(int)
P = 5 / 3
d = d.dropna(subset=['free_obs', 'dimm_obs', 'free_mod', 'w10_mod'])
d = d[(d.free_obs > 0.05) & (d.dimm_obs > 0.1) & (d.dimm_obs < 5)]
# 지표층 관측값: 전체 − 자유대기 (5/3 제곱 공간에서 뺀다)
gl53 = d.dimm_obs ** P - d.free_obs ** P
d['gl_obs'] = np.where(gl53 > 0, np.clip(gl53, 0, None) ** (1 / P), np.nan)
tr, te = d[d.year == 2023], d[d.year == 2024]
out = {'n_train': len(tr), 'n_test': len(te)}

def comb(a, b): return (a ** P + b ** P) ** (1 / P)
def ground_now(u): return 0.5 + 0.06 * np.maximum(0, u)

def score(y, f):
    y, f = np.asarray(y), np.asarray(f); m = np.isfinite(y) & np.isfinite(f); y, f = y[m], f[m]
    g = lambda a: np.digitize(a, [1.0, 1.5, 2.0, 3.0])  # 시상 지수 경계
    return dict(n=int(m.sum()), r=round(stats.pearsonr(y, f)[0], 3), rho=round(stats.spearmanr(y, f)[0], 3),
                bias=round(float(np.mean(f - y)), 3), rmse=round(float(np.sqrt(np.mean((f - y) ** 2))), 3),
                mae=round(float(np.mean(np.abs(f - y))), 3), idx_hit=round(float(np.mean(g(y) == g(f))), 3),
                obs_med=round(float(np.median(y)), 3), fc_med=round(float(np.median(f)), 3))

# ── 1. 현재 식 그대로 ──
out['now_free'] = score(te.free_obs, te.free_mod)
out['now_total'] = score(te.dimm_obs, comb(te.free_mod, ground_now(te.w10_mod)))
out['clim_total'] = score(te.dimm_obs, np.full(len(te), tr.dimm_obs.median()))
out['clim_free'] = score(te.free_obs, np.full(len(te), tr.free_obs.median()))

# ── 2. 자유대기: obs^(5/3) = a·mod^(5/3) + b  (적분 Cn²에 배율 a, 바닥값 b) ──
X = tr.free_mod ** P; Y = tr.free_obs ** P
a, b = np.polyfit(X, Y, 1)
# 비율만(바닥값 0): 로그 중앙값
c = float(np.exp(np.median(np.log(tr.free_obs / tr.free_mod.clip(lower=1e-3)))))
def free_cal(m): return np.clip(a * m ** P + b, 1e-6, None) ** (1 / P)
out['free_fit'] = dict(a=round(a, 4), b=round(b, 4), scale_only=round(c, 3))
out['cal_free'] = score(te.free_obs, free_cal(te.free_mod))
out['cal_free_scale'] = score(te.free_obs, c * te.free_mod)

# 제트 풍속만으로(비교용 단순 예측)
j = tr.dropna(subset=['jet']); ja, jb = np.polyfit(j.jet, j.free_obs, 1)
out['jet_only_free'] = score(te.free_obs, ja * te.jet + jb)
out['jet_fit'] = dict(slope=round(ja, 4), icpt=round(jb, 3))

# ── 3. 지표층: gl_obs^(5/3) = g0 + g1·u (모형 10m 바람) ──
g = tr.dropna(subset=['gl_obs'])
g1, g0 = np.polyfit(g.w10_mod, g.gl_obs ** P, 1)
def ground_cal(u): return np.clip(g0 + g1 * np.maximum(0, u), 1e-6, None) ** (1 / P)
lin1, lin0 = np.polyfit(g.w10_mod, g.gl_obs, 1)
out['ground_fit'] = dict(g0=round(g0, 4), g1=round(g1, 4), lin=f'{lin0:.3f} + {lin1:.4f}u')
out['ground_now'] = score(te.gl_obs, ground_now(te.w10_mod))
out['ground_cal'] = score(te.gl_obs, ground_cal(te.w10_mod))
out['ground_clim'] = score(te.gl_obs, np.full(len(te), g.gl_obs.median()))
out['wind_obs_vs_mod'] = score(te.w10_obs, te.w10_mod)

# 바람 구간별 관측 지표층 중앙값 (전체 기간)
bins = [0, 2, 4, 6, 8, 10, 12, 16, 30]
d['ub'] = pd.cut(d.w10_mod, bins)
out['ground_by_wind'] = {str(k): [int(v.gl_obs.count()), round(float(v.gl_obs.median()), 3), round(float(ground_now(v.w10_mod).median()), 3)] for k, v in d.groupby('ub', observed=True)}
# 모형 자유대기 십분위별 관측 중앙값
d['fb'] = pd.qcut(d.free_mod, 10, duplicates='drop')
out['free_by_decile'] = {f'{k.left:.3f}-{k.right:.3f}': [round(float(v.free_obs.median()), 3)] for k, v in d.groupby('fb', observed=True)}

# ── 4. 보정한 전체 ──
out['cal_total'] = score(te.dimm_obs, comb(free_cal(te.free_mod), ground_cal(te.w10_mod)))
out['cal_total_freeonly'] = score(te.dimm_obs, comb(free_cal(te.free_mod), np.full(len(te), g.gl_obs.median())))
out['gfrac_med'] = round(float(d.gfrac.median()), 3)

print(json.dumps(out, ensure_ascii=False, indent=1))
d.to_csv(sys.argv[2], index=False)
