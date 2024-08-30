import os

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# 환경 변수에서 API 키 가져오기
API_KEY = os.getenv("API_KEY")

@app.get("/fetch-location/")
async def fetch_location(route_id: str):
    if not route_id:
        raise HTTPException(status_code=400, detail="Route ID is required")
    
    api_url = f"http://openapi.changwon.go.kr/rest/bis/BusLocation/?serviceKey={API_KEY}&route={route_id}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(api_url)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching data from external API")
    
    return JSONResponse(content=response.json())

uvicorn.run(app, host="0.0.0.0", port=8000)