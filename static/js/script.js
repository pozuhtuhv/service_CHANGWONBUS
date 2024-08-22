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

        // 드롭다운에서 선택된 버스 정보를 표시하는 함수
        function selectBus(event) {
            const selectedBusInfo = JSON.parse(event.target.value);
            const selectionDiv = document.getElementById('busSelection');
            selectionDiv.innerHTML = `<pre>${JSON.stringify(selectedBusInfo, null, 2)}</pre>`;
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