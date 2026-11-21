"""
Unit and integration tests for SwapSphere API contracts and response structures.
"""

import pytest


@pytest.mark.api
@pytest.mark.unit
class TestApiResponses:
    def test_escrow_endpoint_validation(self, api_client, valid_object_id, mock_users):
        user_id = mock_users["user_alice"]["id"]

        # Missing swapRequestId -> 400
        code, resp = api_client.simulate_escrow_get(auth_user_id=user_id, swap_request_id=None)
        assert code == 400
        assert resp["error"] == "Missing swapRequestId parameter"

        # Invalid swapRequestId -> 400
        code, resp = api_client.simulate_escrow_get(auth_user_id=user_id, swap_request_id="invalid-id")
        assert code == 400
        assert resp["error"] == "Invalid swap request id"

        # Unauthenticated -> 401
        code, resp = api_client.simulate_escrow_get(auth_user_id=None, swap_request_id=valid_object_id)
        assert code == 401
        assert resp["error"] == "Unauthorized"

        # Valid query -> 200
        code, resp = api_client.simulate_escrow_get(auth_user_id=user_id, swap_request_id=valid_object_id)
        assert code == 200
        assert "deposits" in resp
        assert resp["canReveal"] is False

