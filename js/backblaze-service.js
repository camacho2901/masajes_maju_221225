// Servicio de Backblaze B2
class BackblazeService {
    constructor() {
        this.keyId = CONFIG.backblaze.keyId;
        this.applicationKey = CONFIG.backblaze.applicationKey;
        this.bucketId = CONFIG.backblaze.bucketId;
        this.bucketName = CONFIG.backblaze.bucketName;
        this.authToken = null;
        this.apiUrl = null;
        this.downloadUrl = null;
    }

    async authorize() {
        try {
            const credentials = btoa(`${this.keyId}:${this.applicationKey}`);
            const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });

            if (!response.ok) throw new Error('Error de autenticación');
            
            const data = await response.json();
            this.authToken = data.authorizationToken;
            this.apiUrl = data.apiUrl;
            this.downloadUrl = data.downloadUrl;
            
            return true;
        } catch (error) {
            console.error('Error en authorize:', error);
            throw error;
        }
    }

    async getUploadUrl() {
        if (!this.authToken) await this.authorize();

        try {
            const response = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
                method: 'POST',
                headers: {
                    'Authorization': this.authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bucketId: this.bucketId
                })
            });

            if (!response.ok) throw new Error('Error al obtener URL de subida');
            return await response.json();
        } catch (error) {
            console.error('Error en getUploadUrl:', error);
            throw error;
        }
    }

    async uploadImage(file) {
        try {
            const uploadData = await this.getUploadUrl();
            const fileName = `${Date.now()}_${file.name}`;
            
            const response = await fetch(uploadData.uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': uploadData.authorizationToken,
                    'X-Bz-File-Name': encodeURIComponent(fileName),
                    'Content-Type': file.type,
                    'X-Bz-Content-Sha1': 'do_not_verify'
                },
                body: file
            });

            if (!response.ok) throw new Error('Error al subir imagen');
            
            const data = await response.json();
            return {
                url: `${this.downloadUrl}/file/${this.bucketName}/${fileName}`,
                fileId: data.fileId,
                fileName: fileName
            };
        } catch (error) {
            console.error('Error en uploadImage:', error);
            throw error;
        }
    }

    async uploadMultiple(files) {
        try {
            const uploads = Array.from(files).map(file => this.uploadImage(file));
            return await Promise.all(uploads);
        } catch (error) {
            console.error('Error en uploadMultiple:', error);
            throw error;
        }
    }

    async deleteImage(fileId, fileName) {
        if (!this.authToken) await this.authorize();

        try {
            const response = await fetch(`${this.apiUrl}/b2api/v2/b2_delete_file_version`, {
                method: 'POST',
                headers: {
                    'Authorization': this.authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileId: fileId,
                    fileName: fileName
                })
            });

            if (!response.ok) throw new Error('Error al eliminar imagen');
            return await response.json();
        } catch (error) {
            console.error('Error en deleteImage:', error);
            throw error;
        }
    }

    async compressImage(file, maxWidth = 1920, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', quality);
                };

                img.onerror = reject;
            };

            reader.onerror = reject;
        });
    }

    async uploadCompressed(file) {
        try {
            const compressed = await this.compressImage(file);
            return await this.uploadImage(compressed);
        } catch (error) {
            console.error('Error en uploadCompressed:', error);
            throw error;
        }
    }
}

// Instancia global
const backblazeService = new BackblazeService();
const imgurService = backblazeService; // Alias para compatibilidad
