# 창원버스 INFORMATION 수집

**URL** : https://pozuhtuhv.github.io/service_CHANGWONBUS

## 중단
Javascript 로 공공데이터 API 진행할려 했으나 `CORS 정책` 이슈로 인해 작동 안됨.<br>
서비스를 진행할려면 `개인서버를 통해 API 결과를 클라이언트에게 제공`해야함(EX: AWS...)<br>
현재 개인서버를 여는 재산이 없기에 중단<br>
<br>

**크로스 도메인 문제가 없다는 가정하에 스크립트는 완성**<br>
<br>

## 개요

GitHub Actions 으로 자동 창원버스 API DATA 수집.<br>
JavaScript와 HTML을 사용하여 위의 결과를 사용자 친화적인 방식으로 출력.

### 1. 세팅

DATA 수집 설정 : <br>
GitHub Repo Setting -> 공공 API 'SERVICE_KEY' : Secrets 키 설정<br>
GitHub Actions 을 통해 busdatasave.py 를 실행<br>
레포지토리 '창원버스 API' 데이터(json) 푸시

### 2. 계획

좌측 : <br>
검색된 버스 데이터를 가져옴
<br>
우측(Javascript 정책 이슈로 실패) : <br>
검색된 버스의 현재 운행정보를 출력<br>

### 3. DATA

`[1-1]busdata.json, [1-3]stationdata.json` : GitHub Repo Data <br>
`[3-1]busstop.json, [4-1]busposition.json` : API Data

### 4. API
#### 1. 버스 및 정류소 데이터 

- **[경상남도 창원시_기반정보조회서비스](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15000096)**

- **버스노선목록 - [1-1]busdata.json**
  - **매개변수**: `{SERVICE_KEY}`
  - **엔드포인트**: `http://openapi.changwon.go.kr/rest/bis/Bus/?serviceKey={SERVICE_KEY}`
  - **반환 정보 (필요한것만)**:
    - `ROUTE_ID`: 버스 고유 ID
    - `ROUTE_NM`: 버스 번호
    - `STATION_CNT`: 정류장 수
    - `ROUTE_LEN`: 노선 길이
    - `ORGT_STATION_ID`: 기점 정류장 ID
    - `DST_STATION_ID`: 종점 정류장 ID

- **정류소목록 - [1-3]stationdata.json**
  - **매개변수**: `{SERVICE_KEY}`
  - **엔드포인트**: `http://openapi.changwon.go.kr/rest/bis/Station/?serviceKey={SERVICE_KEY}`
  - **반환 정보 (필요한것만)**:
    - `STATION_ID`: 정류소 고유 ID
    - `STATION_NM`: 정류소 이름

#### 2. 버스 도착 정보

- **[경상남도 창원시_버스도착정보조회](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15000386)**

- **정류소버스도착정보** - **[2-1]busarrives.json**
  - **매개변수**: `{SERVICE_KEY}, {STATION_ID}`
  - **엔드포인트**: `http://openapi.changwon.go.kr/rest/bis/BusArrives/?serviceKey={SERVICE_KEY}&station={STATION_ID}`
  - **반환 정보 (필요한것만)**:
    - `ROUTE_ID`: 버스 고유 ID
    - `PREDICT_TRAV_TM`: 도착 예정 시간
    - `LEFT_STATION`: 남은 정류장 수
    - `UPDN_DIR`: 상/하행 구분 (0: 하행, 1: 상행)

#### 3. 버스정류소목록

- **[경상남도 창원시_노선버스위치정류소](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15000254)**

- **버스정류소목록 - [3-1]busstop.json**
  - **매개변수**: `{SERVICE_KEY}, {ROUTE_ID}`
  - **엔드포인트**: `http://openapi.changwon.go.kr/rest/bis/BusLocation/?serviceKey={SERVICE_KEY}&route={ROUTE_ID}`
  - **반환 정보 (필요한것만)**:
    - `rowCount`: 결과 개수 | (총결과/2)+1 = 상행/하행 구분하기 
    - `STATION_ORD`: 정류장 순서
    - `STATION_ID`: 정류소 고유 ID
    - `STATION_NM`: 정류소 이름
    - `EVENT_CD`: 이벤트 코드 (17: 진입, 18: 진출)

#### 4. 현재 운행 버스위치

- **[경상남도 창원시_노선별 버스위치목록](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15000416)**

- **현재 운행 버스위치 - [4-1]busposition.json**
  - **매개변수**: `{SERVICE_KEY}, {ROUTE_ID}`
  - **엔드포인트**: `http://openapi.changwon.go.kr/rest/bis/BusPosition/?serviceKey={SERVICE_KEY}&route={ROUTE_ID}`
  - **반환 정보 (필요한것만)**:
    - `rowCount`: 결과 개수
    - `ARRV_STATION_ID`: 도착한 정류장 ID
    - `LOW_PLATE_TP`: 저상버스 여부
    - `PLATE_NO`: 차량 번호

## PLAN

### PLAN 1: 현재 버스 위치와 다음 정류장 조회

- **STEP 1** : `[1-1]busdata.json`과 `[1-3]stationdata.json` 데이터를 수집.
- **STEP 2** : 입력된 버스 번호(`ROUTE_NM`)를 `[1-1]busdata.json`에서 버스 고유 ID(`ROUTE_ID`)로 매칭.
- **STEP 3** : 버스 고유 ID(`ROUTE_ID`)를 사용해 `[4-1]busposition.json` API로 현재 버스 위치를 조회.
- **STEP 4** : `[3-1]busstop.json`을 사용해 현재 버스 위치의 다음 정류장을 조회.

### PLAN 2: 정류소 검색 -> 상/하행 정류소 목록 조회 -> 도착 정보 조회

- **STEP 1** : `[1-3]stationdata.json` 데이터를 수집.
- **STEP 2** : 입력된 정류소이름(`STATION_NM`)을 통해 정류소 검색 후 목록나열
- **STEP 3** : 선택된 정류소 고유 ID(`STATION_ID`)를 반환.
- **STEP 4** : 정류소 고유 ID(`STATION_ID`)를 사용해 도착 예정 버스 정보를 조회.

### PLAN 3: JavaScript와 HTML을 사용한 출력

- **목적**: JavaScript와 HTML을 사용하여 위의 결과를 사용자 친화적인 방식으로 출력.