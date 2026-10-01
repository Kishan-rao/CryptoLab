import axios from 'axios';

// Vite proxy forwards /api/v1 to http://localhost:8000/api/v1 in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response error handler helper
const handleApiError = (error) => {
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.detail) {
      throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
    }
  }
  throw new Error(error.message || 'An unknown network error occurred.');
};

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (err) {
      return handleApiError(err);
    }
  },

  // Vigenère Cipher
  vigenereEncrypt: async (plaintext, key) => {
    try {
      const response = await apiClient.post('/vigenere/encrypt', { plaintext, key });
      return response.data;
    } catch (err) {
      return handleApiError(err);
    }
  },

  vigenereDecrypt: async (ciphertext, key) => {
    try {
      const response = await apiClient.post('/vigenere/decrypt', { ciphertext, key });
      return response.data;
    } catch (err) {
      return handleApiError(err);
    }
  },

  // AES-128
  aesEncrypt: async (plaintext_hex, key_hex) => {
    try {
      const response = await apiClient.post('/aes/encrypt', { plaintext_hex, key_hex });
      return response.data;
    } catch (err) {
      return handleApiError(err);
    }
  },

  aesDecrypt: async (ciphertext_hex, key_hex) => {
    try {
      const response = await apiClient.post('/aes/decrypt', { ciphertext_hex, key_hex });
      return response.data;
    } catch (err) {
      return handleApiError(err);
    }
  },

  // RSA
  rsaGenerateKeys: async (p, q, e = null) => {
    try {
      const payload = { p: parseInt(p, 10), q: parseInt(q, 10) };
      if (e !== null && e !== undefined && e !== '') {
        payload.e = parseInt(e, 10);
      }
      const response = await apiClient.post('/rsa/generate-keys', payload);
      return response.data;
    } catch (err) {
      return handleApiError(err);
    }
  },

  rsaEncrypt: async (message, message_type, e, n) => {
    try {
      const response = await apiClient.post('/rsa/encrypt', {
        message: String(message),
        message_type,
        e: parseInt(e, 10),
        n: parseInt(n, 10),
      });
      return response.data;
    } catch (err) {
      return handleApiError(err);
    }
  },

  rsaDecrypt: async (ciphertext, message_type, d, n) => {
    try {
      const response = await apiClient.post('/rsa/decrypt', {
        ciphertext: String(ciphertext),
        message_type,
        d: parseInt(d, 10),
        n: parseInt(n, 10),
      });
      return response.data;
    } catch (err) {
      return handleApiError(err);
    }
  },
};

export default api;
