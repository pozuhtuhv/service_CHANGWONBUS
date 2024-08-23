// LEFT ZONE
// GitHub에 있는 JSON 데이터를 가져오는 함수
async function fetchBusData() {
    const response = await fetch('https://pozuhtuhv.github.io/service_CHANGWONBUS/data/%5B1-1%5Dbusdata.json');
    const data = await response.json();
    return data.ServiceResult.MsgBody.BusList.row;
}

// 버스 번호로 데이터를 필터링하는 함수
function searchBus(busNum, busData) {
    return busData.filter(row => row.ROUTE_NM.includes(busNum));
}

// 검색 결과를 드롭다운으로 표시하는 함수
function displayResults(results) {
    const dropdown = document.getElementById('busDropdown');
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

// JSON 데이터 필드를 좀 더 이해하기 쉬운 형태로 변환하는 함수
function transformBusInfo(busInfo) {
    return {
        "순번": busInfo["@index"],
        "버스 ID": busInfo.ROUTE_ID,
        "버스 이름": busInfo.ROUTE_NM,
        "시점 정류장 ID": busInfo.ORGT_STATION_ID,
        "종점 정류장 ID": busInfo.DST_STATION_ID,
        "노선 타입": busInfo.ROUTE_TP,
        "정류장 수": busInfo.STATION_CNT,
        "노선 길이 (m)": busInfo.ROUTE_LEN,
        "노선 색깔": busInfo.ROUTE_COLOR,
        "첫차 시각": busInfo.FIRST_TM,
        "막차 시각": busInfo.LAST_TM,
        "행정구역": busInfo.GOV_NM,
        "최종 업데이트 시간": busInfo.UPD
    };
}

// 드롭다운에서 선택된 버스 정보를 표시하는 함수
function selectBus(event) {
    const selectedBusInfo = JSON.parse(event.target.value);
    const transformedBusInfo = transformBusInfo(selectedBusInfo);
    const selectionDiv = document.getElementById('busSelection');
    selectionDiv.innerHTML = `<pre>${JSON.stringify(transformedBusInfo, null, 2)}</pre>`;
    selectionDiv.style.display = 'block';
}

// 폼 제출 시 검색 기능을 수행하는 함수
async function handleSubmit(event) {
    event.preventDefault();
    const busNum = document.getElementById('busnum').value;
    const busData = await fetchBusData();
    const matchingBuses = searchBus(busNum, busData);
    displayResults(matchingBuses);
}

// 이벤트 리스너 추가
document.getElementById('busForm').addEventListener('submit', handleSubmit);
document.getElementById('busDropdown').addEventListener('change', selectBus);

// RIGHT ZONE

