from fastapi import APIRouter, Depends, status, HTTPException, Path
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_db as get_session
from src.db.auth.dependencies import AccessTokenBearer
from .service import get_all_feeds, get_single_feed
from typing import Dict, List, Any,Union
from fastapi import Query
from datetime import datetime
import logging
# Initialize router and dependencies
device_router = APIRouter()
access_token_bearer = AccessTokenBearer()
logger = logging.getLogger(__name__)
# Dynamic route for individual feeds
@device_router.get("/feeds/{feed_key}", summary="Get a single feed by key")
async def get_single_feed_route(
    feed_key: str = Path(..., description="The key of the feed to retrieve"),
    interval: str = Query(None, description="Time interval for aggregation (e.g., 1h, 1d)"),
    session: AsyncSession = Depends(get_session),
    # Uncomment the following line if authentication is required
    # user_details=Depends(access_token_bearer)
):
    """
    Fetch the newest value for a specific feed and return it.
    """
    try:

        feed_key = feed_key.split(",") if "," in feed_key else feed_key
        logger.info(f"Fetching data for feed: {feed_key} with interval: {interval}")
        return await get_single_feed(feed_key, session,interval)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Route to fetch all feeds
@device_router.get("/feeds/", summary="Get metadata for all feeds")
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