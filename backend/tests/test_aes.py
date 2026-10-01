"""Unit and integration tests for AES-128 implementation and NIST Known-Answer Test vector."""
import pytest
from app.algorithms.symmetric.aes import (
    aes_encrypt_block,
    aes_decrypt_block,
    key_expansion,
    sub_bytes,
    inv_sub_bytes,
    shift_rows,
    inv_shift_rows,
    mix_columns,
    inv_mix_columns,
    add_round_key,
    rot_word,
    sub_word,
    S_BOX,
    INV_S_BOX,
)
from app.utils.encoding import (
    hex_to_bytes,
    bytes_to_hex,
    bytes_to_matrix,
    matrix_to_bytes
)
from app.services.aes_service import AESService

# Official NIST FIPS-197 Known-Answer Test Vector
NIST_KEY_HEX = "000102030405060708090a0b0c0d0e0f"
NIST_PLAINTEXT_HEX = "00112233445566778899aabbccddeeff"
NIST_EXPECTED_CIPHERTEXT_HEX = "69c4e0d86a7b0430d8cdb78070b4c55a"

def test_aes_nist_known_answer_vector_encryption():
    """Mandatory verification: Official NIST FIPS-197 AES-128 test vector encryption."""
    pt_bytes = hex_to_bytes(NIST_PLAINTEXT_HEX)
    key_bytes = hex_to_bytes(NIST_KEY_HEX)
    
    ct_bytes, trace = aes_encrypt_block(pt_bytes, key_bytes)
    ct_hex = bytes_to_hex(ct_bytes)
    
    assert ct_hex == NIST_EXPECTED_CIPHERTEXT_HEX, (
        f"AES-128 failed NIST test vector!\n"
        f"Expected: {NIST_EXPECTED_CIPHERTEXT_HEX}\n"
        f"Actual:   {ct_hex}"
    )
    
    # Check trace structure
    assert len(trace["rounds"]) == 11
    assert len(trace["key_schedule"]) == 11

def test_aes_nist_known_answer_vector_decryption():
    """Mandatory verification: Official NIST FIPS-197 AES-128 test vector decryption."""
    ct_bytes = hex_to_bytes(NIST_EXPECTED_CIPHERTEXT_HEX)
    key_bytes = hex_to_bytes(NIST_KEY_HEX)
    
    pt_bytes, trace = aes_decrypt_block(ct_bytes, key_bytes)
    pt_hex = bytes_to_hex(pt_bytes)
    
    assert pt_hex == NIST_PLAINTEXT_HEX, (
        f"AES-128 decryption failed NIST test vector!\n"
        f"Expected: {NIST_PLAINTEXT_HEX}\n"
        f"Actual:   {pt_hex}"
    )

def test_aes_roundtrip_custom_vectors():
    """Test full encryption and decryption roundtrip on arbitrary blocks and keys."""
    key = hex_to_bytes("2b7e151628aed2a6abf7158809cf4f3c")
    pt = hex_to_bytes("3243f6a8885a308d313198a2e0370734")
    
    ct, _ = aes_encrypt_block(pt, key)
    decrypted, _ = aes_decrypt_block(ct, key)
    assert decrypted == pt

def test_key_expansion_structure():
    key = hex_to_bytes(NIST_KEY_HEX)
    round_keys = key_expansion(key)
    assert len(round_keys) == 11
    # Check that Round 0 key equals original key
    first_key_bytes = matrix_to_bytes(round_keys[0])
    assert bytes_to_hex(first_key_bytes) == NIST_KEY_HEX

def test_subbytes_invsubbytes_invertibility():
    sample_state = [
        [0x00, 0x11, 0x22, 0x33],
        [0x44, 0x55, 0x66, 0x77],
        [0x88, 0x99, 0xAA, 0xBB],
        [0xCC, 0xDD, 0xEE, 0xFF]
    ]
    sub = sub_bytes(sample_state)
    restored = inv_sub_bytes(sub)
    assert restored == sample_state

def test_shiftrows_invshiftrows_invertibility():
    sample_state = [
        [0x01, 0x02, 0x03, 0x04],
        [0x05, 0x06, 0x07, 0x08],
        [0x09, 0x0A, 0x0B, 0x0C],
        [0x0D, 0x0E, 0x0F, 0x10]
    ]
    shifted = shift_rows(sample_state)
    restored = inv_shift_rows(shifted)
    assert restored == sample_state

def test_mixcolumns_invmixcolumns_invertibility():
    sample_state = [
        [0x63, 0xEB, 0x9F, 0xA0],
        [0x2F, 0x93, 0x92, 0xC0],
        [0xAF, 0xC7, 0xAB, 0x30],
        [0xA2, 0x20, 0xCB, 0x2B]
    ]
    mixed = mix_columns(sample_state)
    restored = inv_mix_columns(mixed)
    assert restored == sample_state

def test_addroundkey_involution():
    sample_state = [[0x12, 0x34, 0x56, 0x78] for _ in range(4)]
    key_state = [[0xAB, 0xCD, 0xEF, 0x01] for _ in range(4)]
    xored = add_round_key(sample_state, key_state)
    restored = add_round_key(xored, key_state)
    assert restored == sample_state

def test_aes_service():
    resp_enc = AESService.encrypt(NIST_PLAINTEXT_HEX, NIST_KEY_HEX)
    assert resp_enc.ciphertext_hex == NIST_EXPECTED_CIPHERTEXT_HEX
    assert len(resp_enc.rounds) == 11

    resp_dec = AESService.decrypt(NIST_EXPECTED_CIPHERTEXT_HEX, NIST_KEY_HEX)
    assert resp_dec.plaintext_hex == NIST_PLAINTEXT_HEX

def test_sbox_is_valid_bijection():
    """Regression test: S_BOX and INV_S_BOX must each be a permutation of 0-255.
    Any duplicate or missing entry indicates a table transcription error.
    """
    assert len(S_BOX) == 256, "S_BOX must have exactly 256 entries"
    assert len(INV_S_BOX) == 256, "INV_S_BOX must have exactly 256 entries"
    assert sorted(S_BOX) == list(range(256)), "S_BOX values must be a permutation of 0-255 (no duplicates)"
    assert sorted(INV_S_BOX) == list(range(256)), "INV_S_BOX values must be a permutation of 0-255 (no duplicates)"
    # They must be mutual inverses: INV_S_BOX[S_BOX[i]] == i for all i
    for i in range(256):
        assert INV_S_BOX[S_BOX[i]] == i, f"INV_S_BOX[S_BOX[{i}]] = {INV_S_BOX[S_BOX[i]]}, expected {i}"
