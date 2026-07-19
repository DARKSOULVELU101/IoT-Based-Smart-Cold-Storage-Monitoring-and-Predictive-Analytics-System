import time
from typing import Dict, Tuple
from fastapi import HTTPException, Request


class RateLimiter:
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = {}

    def _get_client_id(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _cleanup(self, client_id: str, now: float):
        if client_id in self.requests:
            self.requests[client_id] = [
                ts for ts in self.requests[client_id]
                if now - ts < self.window_seconds
            ]

    async def __call__(self, request: Request):
        now = time.time()
        client_id = self._get_client_id(request)
        self._cleanup(client_id, now)

        if client_id not in self.requests:
            self.requests[client_id] = []

        if len(self.requests[client_id]) >= self.max_requests:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please slow down.",
            )

        self.requests[client_id].append(now)


rate_limiter = RateLimiter(max_requests=100, window_seconds=60)
