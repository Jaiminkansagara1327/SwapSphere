"""
Unit tests for data validation, field parsers, and type checking in SwapSphere.
"""

from datetime import datetime, timedelta, timezone
import pytest
from tests.conftest import (
    is_valid_object_id,
    trimmed_string,
    parse_optional_positive_int,
    parse_future_date,
    is_listing_type,
    is_item_status,
    is_swap_status,
    is_escrow_status,
    listing_supports_swap,
    listing_supports_sale,
    is_profile_blocked,
)


@pytest.mark.unit
class TestObjectIdValidation:
    def test_valid_24_char_hex_object_id(self):
        assert is_valid_object_id("507f1f77bcf86cd799439011") is True
        assert is_valid_object_id("65f1e8a24c138b725c4ef99a") is True
        assert is_valid_object_id("65F1E8A24C138B725C4EF99A") is True

    @pytest.mark.parametrize("invalid_id", [
        None,
        "",
        "   ",
        "507f1f77bcf86cd79943901",       # 23 chars (too short)
        "507f1f77bcf86cd7994390111",      # 25 chars (too long)
        "507f1f77bcf86cd79943901g",      # non-hex character 'g'
        123456789012345678901234,         # integer instead of string
        {"id": "507f1f77bcf86cd799439011"},
    ])
    def test_invalid_object_ids(self, invalid_id):
        assert is_valid_object_id(invalid_id) is False


@pytest.mark.unit
class TestStringTrimming:
    def test_valid_strings(self):
        assert trimmed_string("hello") == "hello"
        assert trimmed_string("  spanned text  ") == "spanned text"
        assert trimmed_string("\n\t  voucher code \t") == "voucher code"

    @pytest.mark.parametrize("empty_val", [
        "",
        "   ",
        "\t\n",
        None,
        123,
        [],
    ])
    def test_empty_or_non_string_returns_none(self, empty_val):
        assert trimmed_string(empty_val) is None


@pytest.mark.unit
class TestPositiveIntParser:
    def test_valid_positive_integers(self):
        val, err = parse_optional_positive_int(100, "price")
        assert val == 100
        assert err is None

        val, err = parse_optional_positive_int("50", "sellingPrice")
        assert val == 50
        assert err is None

        val, err = parse_optional_positive_int(1.0, "voucherValue")
        assert val == 1
        assert err is None

    def test_empty_or_none_returns_none_without_error(self):
        val, err = parse_optional_positive_int(None, "price")
        assert val is None
        assert err is None

        val, err = parse_optional_positive_int("", "price")
        assert val is None
        assert err is None

    @pytest.mark.parametrize("invalid_val", [
        0,
        -10,
        "-25",
        "abc",
        12.5,
        "15.8",
    ])
    def test_invalid_or_non_positive_int_returns_error(self, invalid_val):
        val, err = parse_optional_positive_int(invalid_val, "price")
        assert val is None
        assert err == "price must be a positive whole number"


@pytest.mark.unit
class TestFutureDateParser:
    def test_valid_future_date(self):
        now = datetime.now(timezone.utc)
        future = now + timedelta(days=7)
        future_iso = future.isoformat()

        parsed, err = parse_future_date(future_iso, "couponExpiry", reference_now=now)
        assert err is None
        assert parsed is not None
        assert parsed > now

    def test_past_date_rejected(self):
        now = datetime.now(timezone.utc)
        past = now - timedelta(days=1)
        past_iso = past.isoformat()

        parsed, err = parse_future_date(past_iso, "couponExpiry", reference_now=now)
        assert parsed is None
        assert err == "couponExpiry must be in the future"

    def test_missing_date_rejected(self):
        parsed, err = parse_future_date("", "couponExpiry")
        assert parsed is None
        assert err == "couponExpiry is required"

    def test_malformed_date_rejected(self):
        parsed, err = parse_future_date("not-a-valid-date", "couponExpiry")
        assert parsed is None
        assert err == "couponExpiry must be a valid date"


@pytest.mark.unit
class TestEnumValidators:
    def test_listing_types(self):
        assert is_listing_type("SWAP_ONLY") is True
        assert is_listing_type("SELL_ONLY") is True
        assert is_listing_type("SWAP_AND_SELL") is True
        assert is_listing_type("RENT_ONLY") is False
        assert is_listing_type(None) is False

    def test_item_statuses(self):
        for status in ["Available", "Pending", "Swapped", "Sold"]:
            assert is_item_status(status) is True
        assert is_item_status("Deleted") is False

    def test_swap_statuses(self):
        for status in ["Pending", "Accepted", "Rejected", "Completed", "Cancelled"]:
            assert is_swap_status(status) is True
        assert is_swap_status("Unknown") is False

    def test_escrow_statuses(self):
        for status in ["pending", "verified", "invalid"]:
            assert is_escrow_status(status) is True
        assert is_escrow_status("approved") is False


@pytest.mark.unit
class TestBusinessRules:
    def test_listing_supports_swap(self):
        assert listing_supports_swap("SWAP_ONLY") is True
        assert listing_supports_swap("SWAP_AND_SELL") is True
        assert listing_supports_swap("SELL_ONLY") is False

    def test_listing_supports_sale(self):
        assert listing_supports_sale("SELL_ONLY") is True
        assert listing_supports_sale("SWAP_AND_SELL") is True
        assert listing_supports_sale("SWAP_ONLY") is False

    def test_profile_blocked_detection(self):
        assert is_profile_blocked({"isBanned": True, "isSuspended": False}) is True
        assert is_profile_blocked({"isBanned": False, "isSuspended": True}) is True
        assert is_profile_blocked({"isBanned": False, "isSuspended": False}) is False
        assert is_profile_blocked({}) is False

