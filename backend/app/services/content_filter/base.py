from abc import ABC, abstractmethod

from pydantic import BaseModel


class FilterResult(BaseModel):
    is_clean: bool
    flagged_words: list[str] = []
    reason: str = ""


class ContentFilterService(ABC):
    @abstractmethod
    async def check_content(self, text: str) -> FilterResult:
        """Check if content passes filters."""
        pass
