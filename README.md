# 창원버스 INFORMATION 수집

**URL** : https://pozuhtuhv.github.io/service_CHANGWONBUS

## 개요

GitHub Actions 으로 자동 창원버스 API DATA 수집.
JavaScript와 HTML을 사용하여 위의 결과를 사용자 친화적인 방식으로 출력.

### 1. 세팅

DATA 수집 설정 : <br>
GitHub Repo Setting -> 공공 API 'SERVICE_KEY' : Secrets 키 설정
GitHub Actions 을 통해 busdatasave.py 를 실행
레포지토리 '창원버스 API' 데이터(json) 푸시

### 2. 계획

좌측 : <br>
검색된 버스 데이터를 가져오고 , 정류장 정보 구분
현재 운행중인 정보([4-1]busposition.json) 에서 하행종점, 상행종점 비교하여 반환

### 3. DATA

`[1-1]busdata.json, [1-3]stationdata.json` : GitHub Repo Data <br>
`[3-1]busstop.json, [4-1]busposition.json` : API Data


## PLAN

### PLAN 1: 현재 버스 위치와 다음 정류장 조회

- **STEP 1** : `[1-1]busdata.json`과 `[1-3]stationdata.json` 데이터를 수집.
- **STEP 2** : 입력된 버스 번호(`ROUTE_NM`)를 `[1-1]busdata.json`에서 버스 고유 ID(`ROUTE_ID`)로 매칭.
- **STEP 3** : 버스 고유 ID(`ROUTE_ID`)를 사용해 `BusPosition` API로 현재 버스 위치를 조회.
- **STEP 4** : `[3-1]busstop.json`을 사용해 현재 버스 위치의 다음 정류장을 조회.

### PLAN 2: 정류소 검색 -> 상/하행 정류소 목록 조회 -> 도착 정보 조회

- **STEP 1** : `[1-3]stationdata.json` 데이터를 수집.
- **STEP 2** : 입력된 정류소이름(`STATION_NM`)을 통해 정류소 검색 후 목록나열
- **STEP 3** : 선택된 정류소 고유 ID(`STATION_ID`)를 반환.
- **STEP 4** : 정류소 고유 ID(`STATION_ID`)를 사용해 도착 예정 버스 정보를 조회.

### PLAN 3: JavaScript와 HTML을 사용한 출력

- **목적**: JavaScript와 HTML을 사용하여 위의 결과를 사용자 친화적인 방식으로 출력.