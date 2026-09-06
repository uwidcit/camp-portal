async function sha256Bytes(text) {
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return new Uint8Array(digest);
}

function xorBytes(data, key) {
  const output = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i += 1) {
    output[i] = data[i] ^ key[i % key.length];
  }
  return output;
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encryptSecret(plaintext, email) {
  const key = await sha256Bytes(email);
  const data = new TextEncoder().encode(plaintext);
  return bytesToBase64(xorBytes(data, key));
}

export async function decryptSecret(ciphertext, email) {
  if (!ciphertext) return null;
  try {
    const key = await sha256Bytes(email);
    const decrypted = xorBytes(base64ToBytes(ciphertext), key);
    const text = new TextDecoder().decode(decrypted);
    if (text === 'pending') return '';
    if (text.startsWith('https://') || text.startsWith('http://')) return text;
    return null;
  } catch {
    return null;
  }
}
