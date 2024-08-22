import datetime
import json
import os

import requests
import xmltodict

# GitHub Actions 환경변수에서 SERVICE_KEY 가져오기
SERVICE_KEY = os.getenv('SERVICE_KEY')

# SERVICE_KEY가 설정되었는지 확인
if not SERVICE_KEY:
    raise ValueError("SERVICE_KEY가 설정되지 않았습니다. GitHub Secrets를 확인하세요.")

# 데이터 저장 디렉토리
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# URL 리스트 정의 BUS, STATION DATA LOAD [1-1], [1-3] 데이터 로드
API_URLS = {
    '[1-1]busdata': f'http://openapi.changwon.go.kr/rest/bis/Bus/?serviceKey={SERVICE_KEY}',
    '[1-3]stationdata': f'http://openapi.changwon.go.kr/rest/bis/Station/?serviceKey={SERVICE_KEY}'
}

# XML 데이터를 가져와 JSON으로 변환 후 파일에 저장
def fetch_and_save_data(url, filename):
    try:
        response = requests.get(url)
        response.raise_for_status()
        xml_data = response.content.decode('utf-8')  # 한글 디코딩
        json_data = json.dumps(xmltodict.parse(xml_data), indent=4, ensure_ascii=False)
        
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(json_data)
        print(f'{filename} 저장 완료')

    except requests.exceptions.RequestException as e:
        print(f'{url}에서 데이터를 가져올 수 없습니다.: {e}')
    except Exception as e:
        print(f'XML 데이터 처리 중 오류가 발생했습니다.: {e}')

def data_save():
    for filename, url in API_URLS.items():
        fetch_and_save_data(url, os.path.join(DATA_DIR, f'{filename}.json'))
        print(f'{filename} reload Done')

data_save()

# commit content test1