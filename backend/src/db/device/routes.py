from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_db as get_session
from src.db.auth.dependencies import AccessTokenBearer
from .service import DeviceService
 
device_router = APIRouter()
access_token_bearer = AccessTokenBearer()
device_service = DeviceService()


@device_router.get("/feeds/temperature")
async def get_temperature_feed(
    session: AsyncSession = Depends(get_session),
    user_details=Depends(access_token_bearer)
):

    try:
        return await device_service.get_single_feed("temperature", session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@device_router.get("/feeds/humidity")
async def get_humidity_feed(
    session: AsyncSession = Depends(get_session),
    user_details=Depends(access_token_bearer)
):
    try:
        return await device_service.get_single_feed("humidity", session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@device_router.get("/feeds/light")
async def get_light_feed(
    session: AsyncSession = Depends(get_session),
    user_details=Depends(access_token_bearer)
):
    try:
        return await device_service.get_single_feed("light", session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@device_router.get("/feeds/motion")
async def get_motion_feed(
    session: AsyncSession = Depends(get_session),
    user_details=Depends(access_token_bearer)
):
    try:
        return await device_service.get_single_feed("motion", session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@device_router.get("/feeds/all")
async def get_all_feeds(
    session: AsyncSession = Depends(get_session),
    user_details=Depends(access_token_bearer)
):
    """
    Fetch metadata for ALL feeds, record the last_value for each in Mongo, and return them all.
    """
    try:
        return await device_service.get_all_feeds(session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
