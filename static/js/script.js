// 난독화로 표시 가능하지만 일단 원본 추가
const SERVICE_KEY = 'q4mVVnThFbLHMkdYVcm2Pw%2BdMQvjZNuHBQ2KEOdz4W9PAwKzsUT76JrtwcFa2ZA3xdr2ObeBYs8jrcGz4I7BvQ%3D%3D'
// 자바스크립트가 사용자 환경에서 실행되는 이상 Github Actions 의 활용이 제한됨 (Secrets 연동 불가) 
// 개인서버 있으면 서버에서 json 데이터 처리 하고 수집후 표시해도 되지만, 없으니 API키 추가


// <---------- API 및 URL 데이터 서비스 영역 ---------->
// 창원시 운용중인 [전체 버스] 데이터를 가져오는 함수 [1-1]
async function fetchBusData() {
    const response = await fetch('https://pozuhtuhv.github.io/service_CHANGWONBUS/data/%5B1-1%5Dbusdata.json');
    const data = await response.json();
    return data.ServiceResult.MsgBody.BusList.row;
}

// 창원시 운용중인 [전체 정류소] 데이터를 가져오는 함수 [1-3]
async function fetchStationData() {
    const response = await fetch('https://pozuhtuhv.github.io/service_CHANGWONBUS/data/%5B1-3%5Dstationdata.json');
    const data = await response.json();
    return data.ServiceResult.MsgBody.StationList.row;
}

// 창원시 해당버스 [전체 정류소 및 진입, 진출]를 가져오는 함수 [3-1]
async function fetchLocation(ROUTE_ID) {
    const response = await fetch(`http://openapi.changwon.go.kr/rest/bis/BusLocation/?serviceKey=${SERVICE_KEY}&route=${ROUTE_ID}`);
    const data = await response.json();
    return data.ServiceResult.MsgBody.BusLocationList.row;
}

// 창원시 해당버스 [현재 위치 정류소] 데이터를 가져오는 함수 [4-1] 
async function fetchPosition(ROUTE_ID) {
    const response = await fetch(`http://openapi.changwon.go.kr/rest/bis/BusPosition/?serviceKey=${SERVICE_KEY}&route=${ROUTE_ID}`);
    const data = await response.json();
    return data.ServiceResult.MsgBody.BusPositionList.row;
}
// <---------- API 및 URL 데이터 서비스 영역 ---------->











// 정류장 ID를 정류장 이름으로 변환하는 함수
function getStationName(stationId, stationData) {
    const station = stationData.find(station => station.STATION_ID === stationId);
    return station ? station.STATION_NM : 'Null'; // 객체가 존재하면 STATION_NM 값을 반환 아니면 Null
}

// 정류소 정보들을 수집변환
async function transformBusInfo(busInfo) {
    const stationData = await fetchStationData();
    const originStationName = getStationName(busInfo.ORGT_STATION_ID, stationData);
    const destinationStationName = getStationName(busInfo.DST_STATION_ID, stationData);

    return `
버스 ID: ${busInfo.ROUTE_ID}<br>
버스 이름: ${busInfo.ROUTE_NM}<br>
시점 정류장: ${originStationName}<br>(ID: ${busInfo.ORGT_STATION_ID})<br>
종점 정류장: ${destinationStationName}<br>(ID: ${busInfo.DST_STATION_ID})<br>
정류장 수: ${busInfo.STATION_CNT}<br>
노선 길이 (m): ${busInfo.ROUTE_LEN}<br>
첫차 시각: ${busInfo.FIRST_TM}<br>
막차 시각: ${busInfo.LAST_TM}<br>
최종 업데이트 시간: ${busInfo.UPD}
    `;
}

// 실제 버스 번호로 데이터를 필터링하는 함수
function searchBus(busNum, busData) {
    return busData.filter(row => row.ROUTE_NM.includes(busNum)); // ROUTE_ID -> 실제번호 변환
}

// LEFT Section (버스의 기본정보 표시)
// 폼 제출 시 검색 기능을 수행하는 함수 (왼쪽 섹션)
async function handleSubmitLeft(event) { // html 에서 폼 제출 이벤트 발생 했을때
    event.preventDefault();
    const busNum = document.getElementById('busnum1').value;
    const busData = await fetchBusData();
    const matchingBuses = searchBus(busNum, busData);
    displayResultsLeft(matchingBuses);
}

// 검색 결과를 드롭다운으로 표시하는 함수 (왼쪽 섹션)
function displayResultsLeft(results) { // html 에서 이벤트 발생 했을때
    const dropdown = document.getElementById('busDropdown1');
    dropdown.innerHTML = ''; // 기존의 드롭다운 옵션들을 초기화

    if (results.length === 0) {
        const option = document.createElement('option');
        option.textContent = '검색된 결과가 없습니다';
        dropdown.appendChild(option);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.textContent = '버스를 선택하세요';
        dropdown.appendChild(defaultOption);

        results.forEach(busInfo => {
            const option = document.createElement('option');
            option.value = JSON.stringify(busInfo); // 버스 정보를 value에 저장
            option.textContent = busInfo.ROUTE_NM;
            dropdown.appendChild(option);
        });
    }
    dropdown.style.display = 'block'; // 드롭다운을 표시
}

// 드롭다운에서 선택된 버스 정보를 표시하는 함수 (왼쪽 섹션)
async function selectBusLeft(event) { // html 에서 드롭다운 이벤트 발생 했을때
    const selectedBusInfo = JSON.parse(event.target.value); // 드롭다운에 선택된 번호
    const transformedBusInfo = await transformBusInfo(selectedBusInfo);
    const selectionDiv = document.getElementById('busSelection1');
    selectionDiv.innerHTML = transformedBusInfo.trim(); // 줄바꿈이 포함된 HTML 삽입
    selectionDiv.style.display = 'block';
}



// RIGHT Section (버스의 현재 위치와 다음 정류장 표시)
// 폼 제출 시 검색 기능을 수행하는 함수 (오른쪽 섹션)
async function handleSubmitRight(event) { // html 에서 폼 제출 이벤트 발생 했을때
    event.preventDefault();
    const busNum = document.getElementById('busnum2').value;
    const busData = await fetchBusData();
    const matchingBuses = searchBus(busNum, busData);
    displayResultsRight(matchingBuses);
}

// 검색 결과를 드롭다운으로 표시하는 함수 (오른쪽 섹션)
function displayResultsRight(results) { // html 에서 이벤트 발생 했을때
    const dropdown = document.getElementById('busDropdown2');
    dropdown.innerHTML = ''; // 기존의 드롭다운 옵션들을 초기화

    if (results.length === 0) {
        const option = document.createElement('option');
        option.textContent = '검색된 결과가 없습니다';
        dropdown.appendChild(option);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.textContent = '버스를 선택하세요';
        dropdown.appendChild(defaultOption);

        results.forEach(busInfo => {
            const option = document.createElement('option');
            option.value = JSON.stringify(busInfo); // 버스 정보를 value에 저장
            option.textContent = busInfo.ROUTE_NM;
            dropdown.appendChild(option);
        });
    }
    dropdown.style.display = 'block'; // 드롭다운을 표시
}

// 드롭다운에서 선택된 버스 정보를 표시하는 함수 (오른쪽 섹션)
async function selectBusRight(event) { // html 에서 드롭다운 이벤트 발생 했을때
    const selectedBusInfo = JSON.parse(event.target.value); // Json 버스 결과
    const routeId = selectedBusInfo.ROUTE_ID;
    const position = await fetchPosition(routeId); // row 가져온 상태
    const stationData = await fetchStationData(); // 정류소 데이터 Json
    const nowbusposition = getStationName(position.ARRV_STATION_ID, stationData);
    const selectionDiv = document.getElementById('busSelection2');
    selectionDiv.innerHTML = nowbusposition.trim(); // 줄바꿈이 포함된 HTML 삽입
    selectionDiv.style.display = 'block';
}