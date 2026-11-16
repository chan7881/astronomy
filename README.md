# astronomy — 천문 관측 예보

오늘 밤 관측할 만한지, 무엇이 언제 보이는지를 한 화면에 보여 주는 정적 사이트.
<https://chan7881.github.io/astronomy/>

## 지금 상태

- 관측지(기본 포항 · 지명 검색 · 좌표 입력 · 현재 위치 · 즐겨찾기)와 5일 밤을 고를 수 있다.
  좌표는 검색창에 `36.02, 129.34`나 `36.02N 129.34E`로 넣는다(글자가 없으면 위도, 경도 순서).
- 판정(관측 점수 + 판정·최적 시간·달·구름·주의), 밤하늘 고도 곡선, 같은 시간축의 기상 띠, 시간별 상세 표, 천체 제원 표.
- 어두운 화면이 기본이고 「적색」 단추로 적색 야간 모드를 켠다.
- 기상 띠의 구름 칸에 숫자(%)가 나온다.
- 아이폰: 사파리 「홈 화면에 추가」로 전체 화면 앱이 되고, 위젯은 Scriptable 앱으로 띄운다(설치 안내 <https://chan7881.github.io/astronomy/widget/>).
  홈 화면 11종(작은 4 · 중간 4 · 큰 3)과 잠금 화면 4종. 위젯에는 적색 모드가 없다.
- 테스트 57개(`npm test`), 변이는 본판 23종 · 위젯 25종 모두 잡힘.

## 남은 일

- **위젯을 실제 아이폰에서 확인**: PC에서는 같은 그리기 명령을 SVG로만 봤다(`widget/preview.html`). 폰에서 볼 것 — 글자 세로 위치·굵기,
  배경 그림이 위젯을 꽉 채우는지, 잠금 화면 위젯, 최신 iOS에서 Scriptable이 도는지.
- 시상 추정식 보정: `groundSeeing`의 계수(0.5 + 0.06×지상풍)는 임시값이다. 며칠치 실제 시상·다른 예보와 견주어 맞춘다.
- 좌표 입력은 배포된 화면에서 눌러 보는 확인이 남았다(테스트는 해석 함수만 본다).
- 지명 검색은 한글 소도시가 잘 안 나온다(Open-Meteo Geocoding 한계). 좌표 입력으로 돌아갈 수 있다.

## 구조

본판은 빌드 없음(`index.html` + ES 모듈, 차트는 직접 그리는 SVG). 위젯만 묶음 파일을 만든다.

| 파일 | 역할 |
|---|---|
| `js/model.js` | 순수 계산 — 온위 기울기·불량층·제트기류·시상·관측 점수·밤 요약 |
| `js/sky.js` | astronomy-engine 래퍼 — 박명·고도 자취·출몰·제원·달 위상 |
| `js/api.js` | Open-Meteo 호출과 정규화(15분 캐시) |
| `js/charts.js` | 고도 곡선·기상 띠 SVG |
| `js/places.js` | 관측지·즐겨찾기·테마 저장 |
| `js/view.js` | 한 밤의 자료 조립(본판과 위젯이 함께 쓴다) |
| `js/main.js` | 화면 조립과 이벤트 |
| `widget/data.js` · `layout.js` | 위젯 자료와 배치 — 그리기 명령 목록을 만든다(순수 계산) |
| `widget/app.js` | Scriptable에서 도는 부분 — 예보 받기, 그리기 명령을 DrawContext로 옮기기 |
| `widget/astro-widget.js` | 위 모듈을 합친 묶음. **`npm run build:widget`으로 만들고 함께 커밋한다**(안 맞으면 테스트가 실패) |
| `widget/loader.js` | 폰의 Scriptable에 붙여 넣는 코드 — 묶음을 6시간마다 새로 받아 실행 |
| `widget/index.html` · `preview.html` | 설치 안내 · PC 미리 보기(`?p=36.17,128.98|보현산`) |
| `manifest.webmanifest` · `icons/` | 홈 화면 앱 설정과 아이콘 |
| `vendor/` | astronomy-engine 2.1.19 고정본(MIT) |
| `docs/concept.html` · `widgets-concept.html` | 승인받은 디자인 시안(위젯 시안은 주소 끝에 `?art`를 붙이면 폰 화면에 올린 모습) |

로컬 실행: `python -m http.server 8741` 뒤 `http://localhost:8741/`.

## 계산

- **불량층**: 인접 기압면의 온위 기울기가 0.5K/100m를 넘는 대류권(200hPa 아래) 구간.
- **제트기류**: 300~200hPa 풍속 최댓값. 20m/s 이하 좋음, 30m/s 초과 나쁨.
- **시상(″)**: 자유대기는 Dewan(1993) 식(Cn² = 2.8 M² L0^(4/3))을 기압면 층마다 적분하고, 지표층 경험식과 5/3 제곱 합으로 합친다. **추정치**다.
- **관측 점수**: 구름이 전체를 깎고 그 안에서 시상·투명도(에어로졸)·달빛이 가감한다. 천문박명 사이의 평균.

## 자료

- 기상·대기질·지명: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0). 한국은 전구 모델(ECMWF·GFS·ICON)만 쓰인다.
- 천체 계산: [astronomy-engine](https://github.com/cosinekitty/astronomy) (MIT).
- 화면 구성은 meteoblue의 seeing 표를 참고했고, meteoblue의 자료는 쓰지 않는다.
