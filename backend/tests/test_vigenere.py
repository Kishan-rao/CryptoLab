"""Unit and integration tests for Vigenère cipher."""
import pytest
from app.algorithms.classical.vigenere import (
    vigenere_encrypt,
    vigenere_decrypt,
    validate_and_normalize_key
)
from app.services.vigenere_service import VigenereService

def test_key_validation_valid():
    assert validate_and_normalize_key("lemon") == "LEMON"
    assert validate_and_normalize_key("LEMON") == "LEMON"
    assert validate_and_normalize_key("  cipher  ") == "CIPHER"

def test_key_validation_invalid():
    with pytest.raises(ValueError, match="empty"):
        validate_and_normalize_key("")
    with pytest.raises(ValueError, match="whitespace"):
        validate_and_normalize_key("   ")
    with pytest.raises(ValueError, match="alphabetic"):
        validate_and_normalize_key("KEY123")
    with pytest.raises(ValueError, match="alphabetic"):
        validate_and_normalize_key("KEY-WORD")

def test_vigenere_classic_vector():
    # Famous standard example: Plaintext "ATTACKATDAWN", Key "LEMON" -> Ciphertext "LXFOPVEFRNHR"
    ciphertext, steps = vigenere_encrypt("ATTACKATDAWN", "LEMON")
    assert ciphertext == "LXFOPVEFRNHR"
    assert len(steps) == 12

    # Decrypt back
    plaintext, d_steps = vigenere_decrypt("LXFOPVEFRNHR", "LEMON")
    assert plaintext == "ATTACKATDAWN"
    assert len(d_steps) == 12

def test_vigenere_case_preservation():
    # Mixed case with spaces and punctuation
    text = "Hello, World!"
    key = "KEY"
    c_text, steps = vigenere_encrypt(text, key)
    # H -> R, e -> i, l -> j, l -> v, o -> s, W -> g, o -> y, r -> b, l -> v, d -> n
    # Decrypt back
    d_text, _ = vigenere_decrypt(c_text, key)
    assert d_text == text
    assert "," in c_text
    assert "!" in c_text
    assert " " in c_text

def test_vigenere_steps_content():
    ciphertext, steps = vigenere_encrypt("HELLO", "KEY")
    # H (7) + K (10) = 17 (R)
    first_step = steps[0]
    assert first_step["plaintext_char"] == "H"
    assert first_step["plaintext_value"] == 7
    assert first_step["key_char"] == "K"
    assert first_step["key_value"] == 10
    assert first_step["ciphertext_value"] == 17
    assert first_step["ciphertext_char"] == "R"
    assert first_step["calculation"] == "(7 + 10) mod 26 = 17"

def test_vigenere_service():
    resp_enc = VigenereService.encrypt("GEEKS", "AYUSH")
    assert resp_enc.mode == "encrypt"
    assert resp_enc.key == "AYUSH"
    
    resp_dec = VigenereService.decrypt(resp_enc.result, "AYUSH")
    assert resp_dec.result == "GEEKS"

def test_empty_input_errors():
    with pytest.raises(ValueError):
        vigenere_encrypt("", "KEY")
    with pytest.raises(ValueError):
        vigenere_decrypt("", "KEY")
