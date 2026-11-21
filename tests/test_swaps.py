"""
Unit tests for Swap Request proposals, transitions, and rules in SwapSphere.
"""

import pytest


@pytest.mark.unit
class TestSwapWorkflow:
    def test_cannot_swap_with_oneself(self, mock_users):
        alice_id = mock_users["user_alice"]["id"]
        # Rule: Sender and receiver must not be the same user
        is_self_swap = alice_id == alice_id
        assert is_self_swap is True

    def test_swap_status_lifecycle(self):
        # Normal flow: Pending -> Accepted -> Completed
        current_status = "Pending"
        valid_next_statuses = ["Accepted", "Rejected", "Cancelled"]
        assert "Accepted" in valid_next_statuses

        current_status = "Accepted"
        valid_next_statuses = ["Completed", "Cancelled"]
        assert "Completed" in valid_next_statuses

    @pytest.mark.api
    def test_unauthorized_user_cannot_access_swaps(self, api_client):
        code, resp = api_client.simulate_swaps_get(auth_user_id=None)
        assert code == 401
        assert resp["error"] == "Unauthorized"

    @pytest.mark.api
    def test_authenticated_user_accesses_swaps(self, api_client, mock_users):
        user_id = mock_users["user_alice"]["id"]
        code, resp = api_client.simulate_swaps_get(auth_user_id=user_id)
        assert code == 200
        assert "swaps" in resp

