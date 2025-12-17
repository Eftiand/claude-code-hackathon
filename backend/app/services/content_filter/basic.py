from __future__ import annotations

import re

from .base import ContentFilterService, FilterResult

# Basic blocked words list - expand as needed
DEFAULT_BLOCKED_WORDS: set[str] = {
    # Placeholder list - add actual blocked words as needed
    "spam",
    "scam",
    "xxx",
    "viagra",
    "casino",
    "lottery",
    "winner",
    "crypto",
    "bitcoin",
    "invest",
}


class BasicContentFilter(ContentFilterService):
    """Basic content filter with word blocking."""

    def __init__(self, blocked_words: set[str] | None = None):
        self._blocked_words = blocked_words or DEFAULT_BLOCKED_WORDS
        # Build regex pattern for word matching
        if self._blocked_words:
            escaped_words = [re.escape(w) for w in self._blocked_words]
            self._pattern = re.compile(
                r"\b(" + "|".join(escaped_words) + r")\b",
                re.IGNORECASE,
            )
        else:
            self._pattern = None

    async def check_content(self, text: str) -> FilterResult:
        """Check if content passes filters."""
        if not self._pattern:
            return FilterResult(is_clean=True)

        matches = self._pattern.findall(text.lower())
        if matches:
            unique_matches = list(set(matches))
            return FilterResult(
                is_clean=False,
                flagged_words=unique_matches,
                reason="Content contains blocked words",
            )

        return FilterResult(is_clean=True)
