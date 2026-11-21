"""
Unit tests for Item creation, marketplace queries, and status management.
"""

import pytest
from tests.conftest import ItemSchema


@pytest.mark.unit
class TestItemSchemaAndModel:
    def test_valid_item_creation(self, valid_object_id, mock_users):
        item_data = {
            "id": valid_object_id,
            "userId": mock_users["user_alice"]["id"],
            "title": "Nike $100 Voucher",
            "description": "Valid for Nike official website and stores",
            "category": "Fashion",
            "condition": "New",
            "listingType": "SWAP_AND_SELL",
            "sellingPrice": 85,
            "voucherValue": 100,
            "brand": "Nike",
            "status": "Available",
            "isCoupon": False,
            "isDeleted": False,
            "isSuspicious": False,
            "verificationStatus": "Approved",
        }
        item = ItemSchema(**item_data)
        assert item.title == "Nike $100 Voucher"
        assert item.sellingPrice == 85
        assert item.status == "Available"
        assert item.isDeleted is False

    def test_item_default_values(self, valid_object_id, mock_users):
        minimal_data = {
            "id": valid_object_id,
            "userId": mock_users["user_bob"]["id"],
            "title": "Minimal Listing",
            "description": "Some description",
            "category": "Electronics",
            "condition": "Used",
        }
        item = ItemSchema(**minimal_data)
        assert item.listingType == "SWAP_ONLY"
        assert item.status == "Available"
        assert item.verificationStatus == "Approved"
        assert item.isDeleted is False
        assert item.isSuspicious is False


@pytest.mark.api
@pytest.mark.unit
class TestItemFilteringLogic:
    def test_price_filter_validation(self, api_client):
        # min > max should fail
        code, resp = api_client.simulate_items_get({"minValue": "100", "maxValue": "50"})
        assert code == 400
        assert resp["error"] == "Minimum price cannot be greater than maximum price"

        # negative price should fail
        code, resp = api_client.simulate_items_get({"minValue": "-5"})
        assert code == 400
        assert resp["error"] == "Price filters must be valid positive numbers"

        # non-numeric price should fail
        code, resp = api_client.simulate_items_get({"maxValue": "xyz"})
        assert code == 400
        assert resp["error"] == "Price filters must be valid positive numbers"

        # valid price range
        code, resp = api_client.simulate_items_get({"minValue": "20", "maxValue": "100"})
        assert code == 200
        assert "items" in resp

