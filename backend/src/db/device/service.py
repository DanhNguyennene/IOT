import anyio
from datetime import datetime
from typing import Dict, List

from fastapi import HTTPException
from Adafruit_IO import Client, RequestError

ADAFRUIT_IO_USERNAME = "YOUR_USERNAME"
ADAFRUIT_IO_KEY = "YOUR_API_KEY"


class DeviceService:
    def __init__(self) -> None:
        self._aio = Client(
            username=ADAFRUIT_IO_USERNAME,
            key=ADAFRUIT_IO_KEY,
        )

    async def _receive_latest(self, feed_key: str):
        """Return the newest Data object for a feed (runs in a thread)."""
        try:
            return await anyio.to_thread.run_sync(self._aio.receive, feed_key)
        except RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Adafruit IO error: {str(exc)}")

    async def _fetch_all_feeds(self):
        try:
            return await anyio.to_thread.run_sync(self._aio.feeds)
        except RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Adafruit IO error: {str(exc)}")

    # ---------- public API methods ---------------------------------------------

    async def get_single_feed(self, feed_key: str, db) -> Dict:
        """
        » Grab the newest value from one feed.
        » Return: {"ok": True, "value": <str>}
        """
        newest = await self._receive_latest(feed_key)

        await db[feed_key].insert_one( 
            {
                "feed_name": feed_key,
                "value": newest.value,
                "created_at": newest.created_at
                or datetime.utcnow().isoformat(timespec="seconds"),
            }
        )

        return {"ok": True, "value": newest.value}

    async def get_all_feeds(self, db) -> Dict[str, List]:
        """
        » List *all* feeds with Adafruit-IO.
        » Store each `last_value` in its own collection.
        » Return all feeds' metadata.
        """
        feeds = await self._fetch_all_feeds()
        feeds_json = [
            {
                "id": f.id,
                "name": f.name,
                "key": f.key,
                "last_value": f.last_value,
                "last_value_at": f.last_value_at,
            }
            for f in feeds
        ]

        for f in feeds:
            await db[f.key].insert_one(  
                {
                    "feed_name": f.key,
                    "value": f.last_value,
                    "created_at": f.last_value_at
                    or datetime.utcnow().isoformat(timespec="seconds"),
                }
            )

        return {"all_feeds": feeds_json}
