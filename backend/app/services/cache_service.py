import os
import json
import time
import hashlib
from typing import Any, Optional
from app.core.config import settings


class CacheService:
    def __init__(self, cache_dir: str = settings.CACHE_DIR, default_ttl: int = settings.CACHE_TTL_SECONDS):
        self.cache_dir = cache_dir
        self.default_ttl = default_ttl
        self._memory_cache = {}
        try:
            os.makedirs(self.cache_dir, exist_ok=True)
        except Exception as e:
            print(f"Warning: Could not create cache directory {self.cache_dir}: {e}")

    def _hash_key(self, key: str) -> str:
        return hashlib.sha256(key.encode("utf-8")).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        now = time.time()
        # Check memory cache
        if key in self._memory_cache:
            val, expiry = self._memory_cache[key]
            if now < expiry:
                return val
            else:
                del self._memory_cache[key]

        # Check disk cache
        try:
            hashed = self._hash_key(key)
            filepath = os.path.join(self.cache_dir, f"{hashed}.json")
            if os.path.exists(filepath):
                with open(filepath, "r", encoding="utf-8") as f:
                    entry = json.load(f)
                if now < entry.get("expiry", 0):
                    data = entry.get("data")
                    self._memory_cache[key] = (data, entry.get("expiry"))
                    return data
                else:
                    os.remove(filepath)
        except Exception as e:
            print(f"Cache get error for key {key}: {e}")

        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        expiry = time.time() + (ttl or self.default_ttl)
        self._memory_cache[key] = (value, expiry)
        try:
            hashed = self._hash_key(key)
            filepath = os.path.join(self.cache_dir, f"{hashed}.json")
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump({"expiry": expiry, "data": value}, f)
        except Exception as e:
            print(f"Cache write error for key {key}: {e}")


cache_service = CacheService()
