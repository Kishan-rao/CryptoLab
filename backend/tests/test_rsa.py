"""Unit and integration tests for RSA cryptosystem and mathematical foundations."""
import pytest
from app.utils.math_utils import (
    gcd,
    extended_gcd,
    mod_inverse,
    mod_exp,
    is_prime
)
from app.algorithms.asymmetric.rsa import (
    generate_rsa_keys,
    rsa_encrypt_number,
    rsa_decrypt_number,
    rsa_encrypt_message,
    rsa_decrypt_message,
    validate_prime_parameters
)
from app.services.rsa_service import RSAService

def test_number_theory_foundations():
    # GCD
    assert gcd(48, 18) == 6
    assert gcd(101, 103) == 1
    assert gcd(0, 15) == 15

    # Extended GCD: a*x + b*y = gcd(a, b)
    g, x, y = extended_gcd(240, 46)
    assert g == 2
    assert 240 * x + 46 * y == 2

    # Primality
    assert is_prime(2) is True
    assert is_prime(3) is True
    assert is_prime(61) is True
    assert is_prime(53) is True
    assert is_prime(1) is False
    assert is_prime(4) is False
    assert is_prime(35) is False

    # Modular Inverse
    # 3 * 7 mod 10 = 21 mod 10 = 1 => 3^(-1) mod 10 = 7
    assert mod_inverse(3, 10) == 7
    # 17 * 2753 mod 3120 = 1
    assert mod_inverse(17, 3120) == 2753

    with pytest.raises(ValueError, match="gcd"):
        mod_inverse(4, 8)

    # Modular Exponentiation
    # 2^10 mod 1000 = 1024 mod 1000 = 24
    assert mod_exp(2, 10, 1000) == 24
    # 65^17 mod 3233 = 2790
    assert mod_exp(65, 17, 3233) == 2790

def test_rsa_keygen_standard_values():
    # p=61, q=53, e=17 => n=3233, phi=3120, d=2753
    keys = generate_rsa_keys(61, 53, chosen_e=17)
    assert keys["n"] == 3233
    assert keys["phi_n"] == 3120
    assert keys["e"] == 17
    assert keys["d"] == 2753
    assert (17 * 2753) % 3120 == 1

def test_rsa_keygen_validation():
    # Non-primes
    with pytest.raises(ValueError, match="not a prime"):
        generate_rsa_keys(12, 17)
    with pytest.raises(ValueError, match="not a prime"):
        generate_rsa_keys(17, 15)
    
    # Equal primes
    with pytest.raises(ValueError, match="distinct"):
        generate_rsa_keys(17, 17)
    
    # Invalid e (not coprime with phi)
    # p=11, q=13, phi=120. If e=10, gcd(10, 120)=10 != 1
    with pytest.raises(ValueError, match="not coprime"):
        generate_rsa_keys(11, 13, chosen_e=10)

def test_rsa_numeric_roundtrip():
    # Textbook example: p=61, q=53, e=17, d=2753, n=3233
    m = 65
    c, enc_trace = rsa_encrypt_number(m, 17, 3233)
    assert c == 2790
    assert len(enc_trace) > 0

    decrypted, dec_trace = rsa_decrypt_number(c, 2753, 3233)
    assert decrypted == m

def test_rsa_message_roundtrip():
    # With p=61, q=53, n=3233 > 127, we can encrypt ASCII text
    msg = "CNS"
    enc = rsa_encrypt_message(msg, 17, 3233, is_numeric=False)
    assert enc["mode"] == "text"
    assert len(enc["blocks"]) == 3

    dec = rsa_decrypt_message(enc["ciphertext"], 2753, 3233, is_numeric=False)
    assert dec["decrypted_message"] == "CNS"

def test_rsa_message_overflow():
    # If m >= n, must raise ValueError
    with pytest.raises(ValueError, match="message < n"):
        rsa_encrypt_number(3500, 17, 3233)

def test_rsa_service():
    keygen = RSAService.generate_keys(17, 19, e=5)
    assert keygen.n == 323
    assert keygen.phi_n == 288
    
    enc = RSAService.encrypt("42", "number", keygen.e, keygen.n)
    dec = RSAService.decrypt(enc.ciphertext, "number", keygen.d, keygen.n)
    assert dec.decrypted_message == "42"
