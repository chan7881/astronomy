# 파라날 MASS-DIMM·기상 관측(ESO)과 Open-Meteo 과거 예보(기압면)를 받는다.
# 사용: python fetch.py <저장 폴더> [--dense] [--model best_match]
#   기압면은 사이트와 같게 js/api.js의 LEVELS를 읽는다. --dense는 27개 면(비교용).
import json, os, re, sys, time, urllib.request, urllib.parse, datetime as dt

args = sys.argv[1:]
OUT = args[0]
DENSE = '--dense' in args
MODEL = args[args.index('--model') + 1] if '--model' in args else 'best_match'
os.makedirs(OUT, exist_ok=True)
LAT, LON = -24.627, -70.404
API = os.path.join(os.path.dirname(__file__), '..', '..', 'js', 'api.js')
SITE_LEVELS = [int(x) for x in re.search(r'LEVELS = \[([^\]]+)\]', open(API, encoding='utf-8').read()).group(1).split(',')]
LEVELS = ([1000, 975, 950, 925, 900, 850, 800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 275, 250,
           225, 200, 175, 150, 125, 100, 70, 50] if DENSE else SITE_LEVELS)

def ok_csv(b): return b.lstrip().startswith((b'Date time,', b'# No data'))
def ok_json(b):
    try: return 'hourly' in json.loads(b)
    except ValueError: return False

def get(url, path, ok, tries=3):
    if os.path.exists(path) and ok(open(path, 'rb').read()):
        return
    for k in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=300) as r:
                data = r.read()
            if not ok(data):
                raise ValueError('예상한 형식이 아님: ' + data[:80].decode('utf-8', 'replace'))
            with open(path, 'wb') as f:   # 받은 뒤에 쓴다 — 실패하면 빈 파일이 남지 않게
                f.write(data)
            return
        except Exception as e:
            print('retry', k, path, e); time.sleep(10)
    raise SystemExit('fail ' + url)

def months(y0, y1):
    for y in range(y0, y1 + 1):
        for m in range(1, 13):
            a = dt.date(y, m, 1)
            yield a, (a + dt.timedelta(days=32)).replace(day=1)

if not DENSE:
    for a, b in months(2023, 2024):
        tag = a.strftime('%Y%m')
        for db in ('mass_paranal', 'meteo_paranal'):
            # 끝 날짜는 그날 0시로 읽힌다 → 다음 달 1일로 줘야 말일 밤이 들어간다(겹치는 0시는 pair.mjs가 지운다)
            q = urllib.parse.urlencode({'wdbo': 'csv', 'start_date': f'{a}..{b}', 'max_rows_returned': 1000000})
            get(f'https://archive.eso.org/wdb/wdb/asm/{db}/query?{q}', f'{OUT}/{db}_{tag}.csv', ok_csv)
        print('eso', tag, flush=True)

vars_ = ['wind_speed_10m'] + [f'{v}_{p}hPa' for p in LEVELS
         for v in ('temperature', 'geopotential_height', 'wind_speed', 'wind_direction')]
for y in (2023, 2024):
    for qtr in range(4):
        a = dt.date(y, 3 * qtr + 1, 1)
        b = (dt.date(y, 3 * qtr + 3, 1) + dt.timedelta(days=32)).replace(day=1) - dt.timedelta(days=1)
        q = urllib.parse.urlencode({'latitude': LAT, 'longitude': LON, 'start_date': a, 'end_date': b,
                                    'hourly': ','.join(vars_), 'wind_speed_unit': 'ms', 'timezone': 'UTC', 'models': MODEL})
        get('https://historical-forecast-api.open-meteo.com/v1/forecast?' + q, f'{OUT}/om_{y}q{qtr+1}.json', ok_json)
        print('om', y, qtr + 1, flush=True)
