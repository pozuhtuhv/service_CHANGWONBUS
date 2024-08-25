import hashlib
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
os.makedirs(DATA_DIR, exist_ok=True)

# URL 리스트 정의 BUS, STATION DATA LOAD [1-1], [1-3] 데이터 로드
API_URLS = {
    '[1-1]busdata': f'http://openapi.changwon.go.kr/rest/bis/Bus/?serviceKey={SERVICE_KEY}',
    '[1-3]stationdata': f'http://openapi.changwon.go.kr/rest/bis/Station/?serviceKey={SERVICE_KEY}'
}

# 해시 계산 함수
def calculate_file_hash(file_path):
    hasher = hashlib.md5()
    with open(file_path, 'rb') as f:
        hasher.update(f.read())
    return hasher.hexdigest()

# XML 데이터를 가져와 JSON으로 변환 후 파일에 저장
def fetch_and_save_data(url, filename):
    try:
        response = requests.get(url)
        response.raise_for_status()
        json_data = json.dumps(xmltodict.parse(response.content.decode('utf-8')), indent=4, ensure_ascii=False)
        
        temp_filename = f"{filename}.temp"
        with open(temp_filename, 'w', encoding='utf-8') as temp_file:
            temp_file.write(json_data)
        
        # 기존 파일이 있는 경우 해시를 비교하여 내용이 동일한지 확인
        if os.path.exists(filename) and calculate_file_hash(filename) == calculate_file_hash(temp_filename):
            print(f'{filename} 파일의 내용이 동일하여 덮어쓰지 않습니다.')
            os.remove(temp_filename)  # 임시 파일 삭제
        else:
            os.rename(temp_filename, filename)
            print(f'{filename} 저장 완료')

    except requests.exceptions.RequestException as e:
        print(f'{url}에서 데이터를 가져올 수 없습니다.: {e}')
    except Exception as e:
        print(f'XML 데이터 처리 중 오류가 발생했습니다.: {e}')

# 모든 데이터를 순회하며 저장
def data_save():
    for filename, url in API_URLS.items():
        fetch_and_save_data(url, os.path.join(DATA_DIR, f'{filename}.json'))

data_save()

# # commit content test2