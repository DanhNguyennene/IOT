from fastapi import FastAPI, HTTPException
import requests
import os
from dotenv import load_dotenv
app = FastAPI()
load_dotenv()
URL_LOGIN = "https://app.coreiot.io/api/auth/login" 
URL_GET_DATA = "https://app.coreiot.io/api/plugins/telemetry/{device}/{device_id}/values/timeseries" 
USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")
DEVICE_ID = os.getenv("DEVICE_ID")
DEVICE = os.getenv("DEVICE")
URL_LOGIN = os.getenv("URL_LOGIN")
URL_GET_DATA = os.getenv("URL_GET_DATA")

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

@app.get("/data/")
def get_data():
    """
    Fetch telemetry data from the external API using the JWT token.
    """
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
        response_get_data = requests.get(url, headers=headers)
        response_get_data.raise_for_status()

        # Return the telemetry data
        return response_get_data.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")
    
if  __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8050)