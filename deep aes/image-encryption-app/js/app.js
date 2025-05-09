/**
 * Image Encryption App
 * Main application script handling UI interactions and encryption/decryption operations
 */

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // Tab switching functionality
    // ========================================
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });

    // ========================================
    // Encryption functionality
    // ========================================
    const encryptDropzone = document.getElementById('encrypt-dropzone');
    const encryptFileInput = document.getElementById('encrypt-file');
    const encryptPreview = document.getElementById('encrypt-preview');
    const encryptImagePreview = document.getElementById('encrypt-image-preview');
    const encryptBtn = document.getElementById('encrypt-btn');
    const encryptPassword = document.getElementById('encrypt-password');
    const encryptLoading = document.getElementById('encrypt-loading');
    const encryptResult = document.getElementById('encrypt-result');
    const downloadEncrypted = document.getElementById('download-encrypted');
    const clearEncrypt = document.getElementById('clear-encrypt');

    let encryptFile = null;
    let encryptedData = null;

    // Dropzone click handler
    encryptDropzone.addEventListener('click', () => {
        encryptFileInput.click();
    });

    // Dropzone drag events
    encryptDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        encryptDropzone.style.borderColor = 'var(--primary)';
    });

    encryptDropzone.addEventListener('dragleave', () => {
        encryptDropzone.style.borderColor = 'var(--border)';
    });

    encryptDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        encryptDropzone.style.borderColor = 'var(--border)';
        
        if (e.dataTransfer.files.length) {
            encryptFileInput.files = e.dataTransfer.files;
            handleEncryptFile(e.dataTransfer.files[0]);
        }
    });

    // File input change handler
    encryptFileInput.addEventListener('change', () => {
        if (encryptFileInput.files.length) {
            handleEncryptFile(encryptFileInput.files[0]);
        }
    });

    // Password input handler
    encryptPassword.addEventListener('input', validateEncryptForm);

    // Process the selected file for encryption
    function handleEncryptFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        encryptFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            encryptImagePreview.src = e.target.result;
            encryptPreview.style.display = 'block';
            validateEncryptForm();
        };
        reader.readAsDataURL(file);
    }

    // Validate encryption form
    function validateEncryptForm() {
        if (encryptFile && encryptPassword.value.trim()) {
            encryptBtn.disabled = false;
        } else {
            encryptBtn.disabled = true;
        }
    }

    // Encrypt button click handler
    encryptBtn.addEventListener('click', async () => {
        encryptLoading.style.display = 'block';
        encryptBtn.disabled = true;
        
        try {
            // Read file as array buffer
            const fileArrayBuffer = await encryptFile.arrayBuffer();
            
            // Convert to Base64
            const fileBase64 = arrayBufferToBase64(fileArrayBuffer);
            
            // Encrypt the image data
            encryptedData = encryptImage(fileBase64, encryptPassword.value);
            
            // Show success result
            encryptLoading.style.display = 'none';
            encryptResult.style.display = 'block';
        } catch (error) {
            console.error('Encryption failed:', error);
            encryptLoading.style.display = 'none';
            alert('Encryption failed: ' + error.message);
            encryptBtn.disabled = false;
        }
    });

    // Download encrypted file
    downloadEncrypted.addEventListener('click', () => {
        if (encryptedData) {
            const blob = new Blob([JSON.stringify(encryptedData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${encryptFile.name}.enc`;
            a.click();
            URL.revokeObjectURL(url);
        }
    });

    // Clear encryption form
    clearEncrypt.addEventListener('click', () => {
        encryptFileInput.value = '';
        encryptPassword.value = '';
        encryptPreview.style.display = 'none';
        encryptResult.style.display = 'none';
        encryptBtn.disabled = true;
        encryptFile = null;
        encryptedData = null;
    });

    // ========================================
    // Decryption functionality
    // ========================================
    const decryptDropzone = document.getElementById('decrypt-dropzone');
    const decryptFileInput = document.getElementById('decrypt-file');
    const decryptBtn = document.getElementById('decrypt-btn');
    const decryptPassword = document.getElementById('decrypt-password');
    const decryptLoading = document.getElementById('decrypt-loading');
    const decryptResult = document.getElementById('decrypt-result');
    const decryptedImagePreview = document.getElementById('decrypted-image-preview');
    const downloadDecrypted = document.getElementById('download-decrypted');
    const clearDecrypt = document.getElementById('clear-decrypt');

    let decryptFile = null;
    let decryptedData = null;

    // Dropzone click handler
    decryptDropzone.addEventListener('click', () => {
        decryptFileInput.click();
    });

    // Dropzone drag events
    decryptDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        decryptDropzone.style.borderColor = 'var(--primary)';
    });

    decryptDropzone.addEventListener('dragleave', () => {
        decryptDropzone.style.borderColor = 'var(--border)';
    });

    decryptDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        decryptDropzone.style.borderColor = 'var(--border)';
        
        if (e.dataTransfer.files.length) {
            decryptFileInput.files = e.dataTransfer.files;
            handleDecryptFile(e.dataTransfer.files[0]);
        }
    });

    // File input change handler
    decryptFileInput.addEventListener('change', () => {
        if (decryptFileInput.files.length) {
            handleDecryptFile(decryptFileInput.files[0]);
        }
    });

    // Password input handler
    decryptPassword.addEventListener('input', validateDecryptForm);

    // Process the selected file for decryption
    function handleDecryptFile(file) {
        decryptFile = file;
        validateDecryptForm();
    }

    // Validate decryption form
    function validateDecryptForm() {
        if (decryptFile && decryptPassword.value.trim()) {
            decryptBtn.disabled = false;
        } else {
            decryptBtn.disabled = true;
        }
    }

    // Decrypt button click handler
    decryptBtn.addEventListener('click', async () => {
        decryptLoading.style.display = 'block';
        decryptBtn.disabled = true;
        
        try {
            // Read encrypted file
            const text = await decryptFile.text();
            const encryptedData = JSON.parse(text);
            
            // Decrypt the data
            const decryptedBase64 = decryptImage(encryptedData, decryptPassword.value);
            
            // Display decrypted image
            decryptedImagePreview.src = decryptedBase64;
            decryptedData = decryptedBase64;
            
            // Show success result
            decryptLoading.style.display = 'none';
            decryptResult.style.display = 'block';
        } catch (error) {
            console.error('Decryption failed:', error);
            decryptLoading.style.display = 'none';
            alert('Decryption failed. Please check your password and file.');
            decryptBtn.disabled = false;
        }
    });

    // Download decrypted image
    downloadDecrypted.addEventListener('click', () => {
        if (decryptedData) {
            const a = document.createElement('a');
            a.href = decryptedData;
            a.download = `decrypted_image.${getImageTypeFromDataURL(decryptedData)}`;
            a.click();
        }
    });

    // Clear decryption form
    clearDecrypt.addEventListener('click', () => {
        decryptFileInput.value = '';
        decryptPassword.value = '';
        decryptResult.style.display = 'none';
        decryptBtn.disabled = true;
        decryptFile = null;
        decryptedData = null;
    });
});