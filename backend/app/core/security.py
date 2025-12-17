import hashlib
import hmac


def hash_ip(ip_address: str, salt: str) -> str:
    """
    Create a secure, non-reversible hash of an IP address.

    Uses HMAC-SHA256 to prevent rainbow table attacks.
    """
    return hmac.new(
        salt.encode("utf-8"),
        ip_address.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
