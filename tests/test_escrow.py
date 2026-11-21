"""
Unit tests for Escrow logic and verification rules in SwapSphere.
"""

import pytest
from tests.conftest import escrow_can_reveal, PHYSICAL_HANDOVER_CODE


@pytest.mark.escrow
@pytest.mark.unit
class TestEscrowRevealRules:
    """
    Test suite for escrowCanReveal business logic matching
    frontend/src/app/api/escrow/route.ts.
    """

    def test_cannot_reveal_with_zero_or_one_deposit(self):
        assert escrow_can_reveal([]) is False
        assert escrow_can_reveal([
            {"couponCode": "AMZN-1234", "verificationStatus": "verified"}
        ]) is False

    def test_two_valid_digital_vouchers_can_reveal(self):
        deposits = [
            {"couponCode": "AMZN-1234", "verificationStatus": "verified"},
            {"couponCode": "STBK-5678", "verificationStatus": "pending"},
        ]
        assert escrow_can_reveal(deposits) is True

    def test_cannot_reveal_if_any_deposit_is_invalid(self):
        deposits = [
            {"couponCode": "AMZN-1234", "verificationStatus": "verified"},
            {"couponCode": "STBK-5678", "verificationStatus": "invalid"},
        ]
        assert escrow_can_reveal(deposits) is False

    def test_physical_handover_requires_verified_digital_counterpart(self):
        # When physical handover is present and counterpart is verified -> can reveal
        deposits_valid = [
            {"couponCode": PHYSICAL_HANDOVER_CODE, "verificationStatus": "pending"},
            {"couponCode": "TARGET-9999", "verificationStatus": "verified"},
        ]
        assert escrow_can_reveal(deposits_valid) is True

        # When physical handover is present but counterpart is still pending -> cannot reveal
        deposits_pending = [
            {"couponCode": PHYSICAL_HANDOVER_CODE, "verificationStatus": "pending"},
            {"couponCode": "TARGET-9999", "verificationStatus": "pending"},
        ]
        assert escrow_can_reveal(deposits_pending) is False

    def test_physical_handover_with_invalid_digital_counterpart(self):
        deposits = [
            {"couponCode": PHYSICAL_HANDOVER_CODE, "verificationStatus": "pending"},
            {"couponCode": "TARGET-9999", "verificationStatus": "invalid"},
        ]
        assert escrow_can_reveal(deposits) is False

    def test_two_physical_handovers_without_digital_code(self):
        deposits = [
            {"couponCode": PHYSICAL_HANDOVER_CODE, "verificationStatus": "verified"},
            {"couponCode": PHYSICAL_HANDOVER_CODE, "verificationStatus": "verified"},
        ]
        # Neither has couponCode != PHYSICAL_HANDOVER_CODE
        assert escrow_can_reveal(deposits) is False

