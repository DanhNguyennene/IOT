from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_db as get_session
from src.db.auth.dependencies import AccessTokenBearer
from .service import FaceIDService
from .service import SignupFaceModel,LoginFaceModel

faceid_router = APIRouter()
access_token_bearer = AccessTokenBearer()
faceid_service = FaceIDService()

@faceid_router.post("/loginface")
async def faceid_login(
    user_details: LoginFaceModel,
    session: AsyncSession = Depends(get_session),
):
    try:
        response = await faceid_service.loginface(user_details, session)
        # print(response)
        return response['data']
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@faceid_router.post("/signupface")
async def faceid_signup(
    userdata: SignupFaceModel,
    user_details: dict = Depends(access_token_bearer),
    session: AsyncSession = Depends(get_session),
    ):
    try:
        return await faceid_service.signupface(user_details,userdata, session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@faceid_router.get("/status")
async def faceid_status(
    session: AsyncSession = Depends(get_session),
    user_details: dict = Depends(access_token_bearer)
):
    try:
        return await faceid_service.get_faceid_status(user_details, session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@faceid_router.post("/disable")
async def faceid_disable(
    session: AsyncSession = Depends(get_session),
    user_details: dict = Depends(access_token_bearer)
):
    try:
        return await faceid_service.disable_faceid(user_details, session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
