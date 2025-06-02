from datetime import datetime
from typing import Dict, List, Any
import httpx
from fastapi import HTTPException

# ADAFRUIT_IO_USERNAME = "YOUR_USERNAME"
# ADAFRUIT_IO_KEY = "YOUR_API_KEY"

async def _receive_latest(feed_key: str) -> Dict[str, Any]:
    """Fetch the latest value for a specific feed."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f'http://coreiot:8050/data/')
            response.raise_for_status()  # Raise an exception for HTTP errors
            data = response.json()
            if feed_key not in data:
                raise HTTPException(status_code=404, detail=f"Feed '{feed_key}' not found.")
            return data[feed_key][0]
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Failed to connect to CoreIoT: {str(exc)}")
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"CoreIoT error: {exc.response.text}")

async def _fetch_all_feeds() -> List[Dict[str, Any]]:
    """Fetch metadata for all feeds."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f'http://coreiot:8050/data/')
            response.raise_for_status()  # Raise an exception for HTTP errors
            return response.json()
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Failed to connect to CoreIoT: {str(exc)}")
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"CoreIoT error: {exc.response.text}")

# ---------- Public API Methods ---------------------------------------------

async def get_single_feed(feed_key: str, db) -> Dict[str, Any]:
    """
    Fetch the newest value from one feed and store it in the database.
    Returns: {"ok": True, "value": <str>}
    """
    try:
        newest_data = await _receive_latest(feed_key)
        newest_value = newest_data["value"]
        newest_ts = newest_data.get("created_at", datetime.utcnow().isoformat(timespec="seconds"))

        print(f"Newest value for {feed_key}: {newest_value} at {newest_ts}")
        
        # Store the value in the database
        db[feed_key].insert_one({
            "feed_name": feed_key,
            "value": newest_value,
            "created_at": newest_ts,
        })

        return {"ok": True, "value": newest_value}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error fetching feed data: {str(exc)}")

async def get_all_feeds(db) -> Dict[str, List[Dict[str, Any]]]:
    """
    Fetch metadata for all feeds, store the last value of each feed in the database,
    and return all feeds' metadata.
    """
    try:
        feeds = await _fetch_all_feeds()
        feeds_json = []

        for feed in feeds:
            feed_key = feed.get("key")
            last_value = feed.get("last_value")
            last_value_at = feed.get("last_value_at", datetime.utcnow().isoformat(timespec="seconds"))

            # Store the last value in the database
            db[feed_key].insert_one({
                "feed_name": feed_key,
                "value": last_value,
                "created_at": last_value_at,
            })

            # Prepare metadata for the response
            feeds_json.append({
                "id": feed.get("id"),
                "name": feed.get("name"),
                "key": feed_key,
                "last_value": last_value,
                "last_value_at": last_value_at,
            })

        return {"all_feeds": feeds_json}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error fetching all feeds: {str(exc)}")