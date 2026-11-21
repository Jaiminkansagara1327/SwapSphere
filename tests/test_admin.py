"""
Unit tests for Admin controls, moderation, and user account status.
"""

import pytest
from tests.conftest import ProfileSchema, is_profile_blocked


@pytest.mark.admin
@pytest.mark.unit
class TestAdminControls:
    def test_admin_role_authorization(self, mock_users):
        admin = mock_users["admin_user"]
        regular_user = mock_users["user_alice"]

        assert admin["role"] == "ADMIN"
        assert regular_user["role"] == "USER"

    def test_banned_user_blocked_from_actions(self, mock_users):
        banned = mock_users["banned_user"]
        assert is_profile_blocked(banned) is True

    def test_suspended_user_blocked_from_actions(self, mock_users):
        suspended = mock_users["suspended_user"]
        assert is_profile_blocked(suspended) is True

    def test_active_user_not_blocked(self, mock_users):
        active = mock_users["user_alice"]
        assert is_profile_blocked(active) is False

    def test_trust_score_bounds(self):
        profile = ProfileSchema(
            id="user_valid_123",
            username="trust_test",
            trustScore=85,
        )
        assert 0 <= profile.trustScore <= 100

        with pytest.raises(Exception):
            ProfileSchema(
                id="user_invalid_123",
                username="trust_fail",
                trustScore=150,  # exceeds max
            )

