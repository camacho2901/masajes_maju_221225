// Servicio de Imgur
class ImgurService {
    constructor() {
        this.clientId = CONFIG.imgur.clientId;
        this.uploadEndpoint = CONFIG.imgur.uploadEndpoint;
    }

    // Subir imagen
    async uploadImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(this.uploadEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Client-ID ${this.clientId}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Error al subir imagen');
            
            const data = await response.json();
            return {
                url: data.data.link,
                deleteHash: data.data.deletehash,
                id: data.data.id
            };
        } catch (error) {
            console.error('Error en uploadImage:', error);
            throw error;
        }
    }

    // Subir múltiples imágenes
    async uploadMultiple(files) {
        try {
            const uploads = Array.from(files).map(file => this.uploadImage(file));
            return await Promise.all(uploads);
        } catch (error) {
            console.error('Error en uploadMultiple:', error);
            throw error;
        }
    }

    // Eliminar imagen
    async deleteImage(deleteHash) {
        try {
            const response = await fetch(`https://api.imgur.com/3/image/${deleteHash}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Client-ID ${this.clientId}`
                }
            });

            if (!response.ok) throw new Error('Error al eliminar imagen');
            return await response.json();
        } catch (error) {
            console.error('Error en deleteImage:', error);
            throw error;
        }
    }

    // Comprimir imagen antes de subir
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

    // Subir con compresión
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
const imgurService = new ImgurService();