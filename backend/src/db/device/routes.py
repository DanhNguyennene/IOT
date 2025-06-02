from fastapi import APIRouter, Depends, status, HTTPException, Path
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_db as get_session
from src.db.auth.dependencies import AccessTokenBearer
from .service import get_all_feeds, get_single_feed

# Initialize router and dependencies
device_router = APIRouter()
access_token_bearer = AccessTokenBearer()

# Dynamic route for individual feeds
@device_router.get("/feeds/{feed_key}", summary="Get a single feed by key")
async def get_single_feed_route(
    feed_key: str = Path(..., description="The key of the feed to retrieve"),
    session: AsyncSession = Depends(get_session),
    # Uncomment the following line if authentication is required
    # user_details=Depends(access_token_bearer)
):
    """
    Fetch the newest value for a specific feed and return it.
    """
    try:
        return await get_single_feed(feed_key, session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Route to fetch all feeds
@device_router.get("/feeds/all", summary="Get metadata for all feeds")
async def get_all_feeds_route(
    session: AsyncSession = Depends(get_session),
    # Uncomment the following line if authentication is required
    # user_details=Depends(access_token_bearer)
):
    """
    Fetch metadata for ALL feeds, record the last_value for each in Mongo, and return them all.
    """
    try:
        return await get_all_feeds(session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))