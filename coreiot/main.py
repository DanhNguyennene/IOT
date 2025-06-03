from fastapi import FastAPI, HTTPException
import requests
import os
from dotenv import load_dotenv
from typing import Optional
from fastapi import Query
app = FastAPI()
load_dotenv()
URL_LOGIN = "https://app.coreiot.io/api/auth/login" 
TS_PLACEHOLDER = "&startTs={startTs}&endTs={endTs}"
KEY_PLACEHOLDER = "?keys={keys}"
URL_GET_DATA = "https://app.coreiot.io/api/plugins/telemetry/{device}/{device_id}/values/timeseries" 
USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")
DEVICE_ID = os.getenv("DEVICE_ID")
DEVICE = os.getenv("DEVICE")
URL_LOGIN = os.getenv("URL_LOGIN")
URL_GET_DATA = os.getenv("URL_GET_DATA")
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
@app.post("/login/")
def login():
    """
    Authenticate with the external API and return the JWT token.
    """
    try:
        # Perform login to get the JWT token
        response_login = requests.post(
            URL_LOGIN,
            json={"username": USERNAME, "password": PASSWORD}
        )
        response_login.raise_for_status()  # Raise an error for bad status codes
        jwt_token = response_login.json().get("token")
        if not jwt_token:
            raise HTTPException(status_code=400, detail="Token not found in login response")
        return {"jwt_token": jwt_token}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.get("/data")
def get_data(
    keys: Optional[str] = Query(None, description="Comma-separated list of telemetry keys (e.g., temperature,humidity)"),
    interval: Optional[str] = Query(None, description="Time interval for aggregation (e.g., 1h, 1d)")
):
    """
    Fetch telemetry data based on specified keys and interval.

    - **keys**: A comma-separated list of telemetry keys to fetch (e.g., temperature,humidity).
    - **interval**: The time interval for data aggregation (e.g., 1h for hourly, 1d for daily).

    Returns:
    - JSON response containing the requested telemetry data.
    """
    if interval is not None:
        CONVERSION_FACTORS = {
            's': 1000,
            'm': 60 * 1000, 
            "h": 3600 * 1000, 
            "d": 86400 * 1000,
        }
        
        if interval[-1] not in CONVERSION_FACTORS:
            raise ValueError(f"Unsupported interval unit: '{interval[-1]}'. Supported units are: {list(CONVERSION_FACTORS.keys())}.")
    interval = int(interval[:-1]) * CONVERSION_FACTORS.get(interval[-1], 1) if interval else None
    # Split the keys into a list
    if keys is not None:
        key_list = keys.split(",")

    try:
        # Step 1: Login to get the JWT token
        response_login = requests.post(
            URL_LOGIN,
            json={"username": USERNAME, "password": PASSWORD}
        )
        response_login.raise_for_status()
        jwt_token = response_login.json().get("token")
        if not jwt_token:
            raise HTTPException(status_code=400, detail="Token not found in login response")

        # Step 2: Use the JWT token to fetch telemetry data
        headers = {
            "Authorization": f"Bearer {jwt_token}"
        }
        url = URL_GET_DATA.format(device=DEVICE, device_id=DEVICE_ID)
        response_list_get_data = {}
        logger.info(f"Fetching data for keys: {keys} with interval: {interval}")
        if keys:
            if len(key_list) > 1:
                keys = ','.join(key_list)
            url += KEY_PLACEHOLDER.format(keys=keys)
            for keys in key_list:
                if interval:
                    response_get_data = requests.get(url, headers=headers)
                    response_get_data.raise_for_status()
                    # LOG
                    logger.info(f"Response: {response_get_data.json()}")
                    print(f"Response: {response_get_data.json()}")
                    endTs = response_get_data.json()[f'{keys}'][0].get("ts", 0)
                    startTs = endTs - int(interval)
                    print(f"startTs: {startTs}, endTs: {endTs}")
                    url += TS_PLACEHOLDER.format(startTs=startTs, endTs=endTs)

                response_get_data = requests.get(url, headers=headers)
                response_get_data.raise_for_status()
                response_list_get_data[keys] = response_get_data.json()[f'{keys}']
        logger.info(f"Response: {response_list_get_data}")
        # Return the telemetry data
        return response_list_get_data
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")
    
    
if  __name__ == "__main__":
    import uvicorn
    HOST = os.getenv("HOST", "")
    uvicorn.run(app, host=HOST, port=8050)