"""
Unit tests for user reviews, ratings calculation, and trust score impact.
"""

import pytest
from tests.conftest import calculate_average_rating


@pytest.mark.unit
class TestReviewCalculations:
    def test_empty_reviews_yields_zero_average(self):
        avg, count = calculate_average_rating([])
        assert avg == 0.0
        assert count == 0

    def test_single_review_average(self):
        avg, count = calculate_average_rating([{"rating": 5}])
        assert avg == 5.0
        assert count == 1

    def test_multiple_reviews_rounded_to_one_decimal(self):
        reviews = [
            {"rating": 5},
            {"rating": 4},
            {"rating": 4},
        ]
        # (5 + 4 + 4) / 3 = 13 / 3 = 4.3333 -> 4.3
        avg, count = calculate_average_rating(reviews)
        assert avg == 4.3
        assert count == 3

    def test_review_rating_range_validation(self):
        def is_valid_rating(val):
            return isinstance(val, int) and 1 <= val <= 5

        assert is_valid_rating(1) is True
        assert is_valid_rating(5) is True
        assert is_valid_rating(0) is False
        assert is_valid_rating(6) is False
        assert is_valid_rating(4.5) is False

