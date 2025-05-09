/**
 * Image Encryption/Decryption Module
 * This module provides functions for AES encryption and decryption of image data
 */

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Helper function to get image type from data URL
function getImageTypeFromDataURL(dataURL) {
    const match = dataURL.match(/^data:image\/(\w+);base64,/);
    return match ? match[1] : 'png';
}

/**
 * Encrypt image data using AES encryption
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} password - Password for encryption
 * @returns {Object} Encrypted data with salt and IV
 */
function encryptImage(base64Data, password) {
    // Generate salt and iv
    const salt = CryptoJS.lib.WordArray.random(128/8);
    const iv = CryptoJS.lib.WordArray.random(128/8);
    
    // Generate key from password and salt
    const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 1000
    });
    
    // Encrypt the image data
    const encrypted = CryptoJS.AES.encrypt(base64Data, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    
    // Return encrypted data with salt and iv
    return {
        salt: salt.toString(),
        iv: iv.toString(),
        encrypted: encrypted.toString()
    };
}

function decryptImage(encryptedData, password) {
    const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
    const ciphertext = encryptedData.encrypted;

    const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 1000
    });

    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    const base64 = decrypted.toString(CryptoJS.enc.Utf8);

    // Wrap with data:image/png header if needed
    if (!base64.startsWith("data:image")) {
        return "data:image/png;base64," + base64;
    }

    return base64;
}
