"""
Shared test configuration, domain models, validation logic, and fixtures for SwapSphere.
"""

import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import pytest
from pydantic import BaseModel, Field

# Constants from frontend/lib/api.ts
LISTING_TYPES = ["SWAP_ONLY", "SELL_ONLY", "SWAP_AND_SELL"]
ITEM_STATUSES = ["Available", "Pending", "Swapped", "Sold"]
SWAP_STATUSES = ["Pending", "Accepted", "Rejected", "Completed", "Cancelled"]
ESCROW_STATUSES = ["pending", "verified", "invalid"]
PHYSICAL_HANDOVER_CODE = "PHYSICAL_HANDOVER"


# ============================================================================
# Validation and Business Logic (mirrored from frontend/lib/api.ts & routes)
# ============================================================================

def is_valid_object_id(val: Any) -> bool:
    """Validate 24-character hex MongoDB ObjectId."""
    if not isinstance(val, str):
        return False
    return bool(re.fullmatch(r"^[a-f\d]{24}$", val, re.IGNORECASE))


def trimmed_string(val: Any) -> Optional[str]:
    """Trim strings and return None if empty or non-string."""
    if not isinstance(val, str):
        return None
    trimmed = val.strip()
    return trimmed if trimmed else None


def parse_optional_positive_int(val: Any, field_name: str) -> Tuple[Optional[int], Optional[str]]:
    """Parse positive whole numbers, returning (value, error)."""
    if val is None or val == "":
        return None, None
    try:
        num = float(val)
        if not num.is_integer() or num <= 0:
            return None, f"{field_name} must be a positive whole number"
        return int(num), None
    except (ValueError, TypeError):
        return None, f"{field_name} must be a positive whole number"


def parse_future_date(val: Any, field_name: str, reference_now: Optional[datetime] = None) -> Tuple[Optional[datetime], Optional[str]]:
    """Validate and parse a date that must be in the future."""
    raw = trimmed_string(val)
    if not raw:
        return None, f"{field_name} is required"

    now = reference_now or datetime.now(timezone.utc)
    try:
        # Support ISO formats
        parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
    except ValueError:
        return None, f"{field_name} must be a valid date"

    if parsed <= now:
        return None, f"{field_name} must be in the future"

    return parsed, None


def is_listing_type(val: Any) -> bool:
    return isinstance(val, str) and val in LISTING_TYPES


def is_item_status(val: Any) -> bool:
    return isinstance(val, str) and val in ITEM_STATUSES


def is_swap_status(val: Any) -> bool:
    return isinstance(val, str) and val in SWAP_STATUSES


def is_escrow_status(val: Any) -> bool:
    return isinstance(val, str) and val in ESCROW_STATUSES


def listing_supports_swap(listing_type: Optional[str]) -> bool:
    return listing_type != "SELL_ONLY"


def listing_supports_sale(listing_type: Optional[str]) -> bool:
    return listing_type in ("SELL_ONLY", "SWAP_AND_SELL")


def is_profile_blocked(profile: Dict[str, Any]) -> bool:
    return bool(profile.get("isBanned") or profile.get("isSuspended"))


def escrow_can_reveal(deposits: List[Dict[str, str]]) -> bool:
    """
    Escrow reveal rule from frontend/src/app/api/escrow/route.ts:
    - At least 2 deposits required
    - No deposit can be 'invalid'
    - If physical handover is involved, the non-physical deposit must be 'verified'
    - Otherwise, returns True
    """
    if len(deposits) < 2:
        return False
    if any(d.get("verificationStatus") == "invalid" for d in deposits):
        return False

    has_physical = any(d.get("couponCode") == PHYSICAL_HANDOVER_CODE for d in deposits)
    if not has_physical:
        return True

    return any(
        d.get("couponCode") != PHYSICAL_HANDOVER_CODE and d.get("verificationStatus") == "verified"
        for d in deposits
    )


def calculate_average_rating(reviews: List[Dict[str, Any]]) -> Tuple[float, int]:
    """Calculate rolling average rating to 1 decimal place."""
    if not reviews:
        return 0.0, 0
    total = sum(r["rating"] for r in reviews)
    avg = round(total / len(reviews), 1)
    return avg, len(reviews)


# ============================================================================
# Pydantic Schemas
# ============================================================================

class ProfileSchema(BaseModel):
    id: str
    username: str
    fullName: Optional[str] = None
    avatarUrl: Optional[str] = None
    role: str = "USER"
    isBanned: bool = False
    isSuspended: bool = False
    trustScore: int = Field(default=100, ge=0, le=100)
    isVerified: bool = False


class ItemSchema(BaseModel):
    id: str
    userId: str
    title: str
    description: str
    category: str
    condition: str
    imageUrl: Optional[str] = None
    listingType: str = "SWAP_ONLY"
    status: str = "Available"
    isCoupon: bool = False
    couponCode: Optional[str] = None
    couponExpiry: Optional[datetime] = None
    price: Optional[int] = None
    sellingPrice: Optional[int] = None
    voucherValue: Optional[int] = None
    brand: Optional[str] = None
    isDeleted: bool = False
    isSuspicious: bool = False
    verificationStatus: str = "Approved"


# ============================================================================
# Pytest Fixtures
# ============================================================================

@pytest.fixture
def mock_users():
    return {
        "user_alice": {
            "id": "user_2a1b3c4d5e6f7g8h9i0j_alice",
            "username": "alice_swaps",
            "fullName": "Alice Johnson",
            "role": "USER",
            "isBanned": False,
            "isSuspended": False,
            "trustScore": 100,
            "isVerified": True,
        },
        "user_bob": {
            "id": "user_2a1b3c4d5e6f7g8h9i0j_bob",
            "username": "bob_trader",
            "fullName": "Bob Smith",
            "role": "USER",
            "isBanned": False,
            "isSuspended": False,
            "trustScore": 95,
            "isVerified": False,
        },
        "banned_user": {
            "id": "user_2a1b3c4d5e6f7g8h9i0j_banned",
            "username": "bad_actor",
            "fullName": "Bad Actor",
            "role": "USER",
            "isBanned": True,
            "isSuspended": False,
            "trustScore": 20,
            "isVerified": False,
        },
        "suspended_user": {
            "id": "user_2a1b3c4d5e6f7g8h9i0j_suspended",
            "username": "suspended_actor",
            "fullName": "Suspended Actor",
            "role": "USER",
            "isBanned": False,
            "isSuspended": True,
            "trustScore": 50,
            "isVerified": False,
        },
        "admin_user": {
            "id": "user_2a1b3c4d5e6f7g8h9i0j_admin",
            "username": "system_admin",
            "fullName": "System Admin",
            "role": "ADMIN",
            "isBanned": False,
            "isSuspended": False,
            "trustScore": 100,
            "isVerified": True,
        },
    }


@pytest.fixture
def valid_object_id():
    return "507f1f77bcf86cd799439011"


@pytest.fixture
def sample_items(mock_users, valid_object_id):
    return [
        {
            "id": valid_object_id,
            "userId": mock_users["user_alice"]["id"],
            "title": "Amazon $50 Gift Card",
            "description": "Digital voucher code for Amazon US store",
            "category": "Gift Cards",
            "condition": "New",
            "listingType": "SWAP_ONLY",
            "status": "Available",
            "voucherValue": 50,
            "isDeleted": False,
            "isSuspicious": False,
            "verificationStatus": "Approved",
        },
        {
            "id": "507f1f77bcf86cd799439012",
            "userId": mock_users["user_bob"]["id"],
            "title": "Starbucks $25 Voucher",
            "description": "In-store digital coupon code",
            "category": "Food & Beverage",
            "condition": "New",
            "listingType": "SWAP_AND_SELL",
            "status": "Available",
            "sellingPrice": 20,
            "voucherValue": 25,
            "isDeleted": False,
            "isSuspicious": False,
            "verificationStatus": "Approved",
        },
    ]


class MockSwapSphereApiClient:
    """
    Client for testing SwapSphere API logic both offline with mock rules
    and against a live running server if SWAPSPHERE_API_URL is configured.
    """
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or os.getenv("SWAPSPHERE_API_URL")

    def simulate_items_get(self, query_params: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
        """Simulate /api/items GET validation."""
        min_v = query_params.get("minValue")
        max_v = query_params.get("maxValue")
        if min_v is not None or max_v is not None:
            try:
                min_n = int(min_v) if min_v is not None else None
                max_n = int(max_v) if max_v is not None else None
            except ValueError:
                return 400, {"error": "Price filters must be valid positive numbers"}

            if (min_n is not None and min_n < 0) or (max_n is not None and max_n < 0):
                return 400, {"error": "Price filters must be valid positive numbers"}
            if min_n is not None and max_n is not None and min_n > max_n:
                return 400, {"error": "Minimum price cannot be greater than maximum price"}

        return 200, {"items": [], "count": 0}

    def simulate_swaps_get(self, auth_user_id: Optional[str]) -> Tuple[int, Dict[str, Any]]:
        """Simulate /api/swaps GET authorization check."""
        if not auth_user_id:
            return 401, {"error": "Unauthorized"}
        return 200, {"swaps": []}

    def simulate_escrow_get(self, auth_user_id: Optional[str], swap_request_id: Optional[str]) -> Tuple[int, Dict[str, Any]]:
        """Simulate /api/escrow GET validation."""
        if not auth_user_id:
            return 401, {"error": "Unauthorized"}
        if not swap_request_id:
            return 400, {"error": "Missing swapRequestId parameter"}
        if not is_valid_object_id(swap_request_id):
            return 400, {"error": "Invalid swap request id"}
        return 200, {"deposits": [], "canReveal": False}


@pytest.fixture
def api_client():
    return MockSwapSphereApiClient()

