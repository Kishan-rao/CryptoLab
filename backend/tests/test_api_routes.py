"""Integration tests for all FastAPI REST API routes."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "vigenere" in data["algorithms"]
    assert "aes-128" in data["algorithms"]
    assert "rsa" in data["algorithms"]

def test_vigenere_api():
    # Encrypt
    enc_resp = client.post("/api/v1/vigenere/encrypt", json={"plaintext": "HELLO", "key": "KEY"})
    assert enc_resp.status_code == 200
    data = enc_resp.json()
    assert data["result"] == "RIJVS"
    assert len(data["steps"]) == 5

    # Decrypt
    dec_resp = client.post("/api/v1/vigenere/decrypt", json={"ciphertext": "RIJVS", "key": "KEY"})
    assert dec_resp.status_code == 200
    assert dec_resp.json()["result"] == "HELLO"

    # Invalid Key validation (numbers in key)
    err_resp = client.post("/api/v1/vigenere/encrypt", json={"plaintext": "HELLO", "key": "KEY123"})
    assert err_resp.status_code in (400, 422)

def test_aes_api():
    nist_pt = "00112233445566778899aabbccddeeff"
    nist_key = "000102030405060708090a0b0c0d0e0f"
    nist_ct = "69c4e0d86a7b0430d8cdb78070b4c55a"

    # Encrypt
    enc_resp = client.post("/api/v1/aes/encrypt", json={"plaintext_hex": nist_pt, "key_hex": nist_key})
    assert enc_resp.status_code == 200
    data = enc_resp.json()
    assert data["ciphertext_hex"] == nist_ct
    assert len(data["rounds"]) == 11

    # Decrypt
    dec_resp = client.post("/api/v1/aes/decrypt", json={"ciphertext_hex": nist_ct, "key_hex": nist_key})
    assert dec_resp.status_code == 200
    assert dec_resp.json()["plaintext_hex"] == nist_pt

    # Invalid hex input length
    bad_resp = client.post("/api/v1/aes/encrypt", json={"plaintext_hex": "1234", "key_hex": nist_key})
    assert bad_resp.status_code in (400, 422)

def test_rsa_api():
    # KeyGen
    kg_resp = client.post("/api/v1/rsa/generate-keys", json={"p": 61, "q": 53, "e": 17})
    assert kg_resp.status_code == 200
    kg_data = kg_resp.json()
    assert kg_data["n"] == 3233
    assert kg_data["d"] == 2753

    # Encrypt numeric
    enc_resp = client.post("/api/v1/rsa/encrypt", json={
        "message": "65",
        "message_type": "number",
        "e": 17,
        "n": 3233
    })
    assert enc_resp.status_code == 200
    assert enc_resp.json()["ciphertext"] == "2790"

    # Decrypt numeric
    dec_resp = client.post("/api/v1/rsa/decrypt", json={
        "ciphertext": "2790",
        "message_type": "number",
        "d": 2753,
        "n": 3233
    })
    assert dec_resp.status_code == 200
    assert dec_resp.json()["decrypted_message"] == "65"

    # Non-prime validation error
    err_resp = client.post("/api/v1/rsa/generate-keys", json={"p": 12, "q": 53})
    assert err_resp.status_code == 400
