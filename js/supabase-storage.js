// Servicio de Supabase Storage
class SupabaseStorage {
    constructor() {
        this.url = CONFIG.supabase.url;
        this.anonKey = CONFIG.supabase.anonKey;
        this.bucket = CONFIG.supabase.storageBucket || 'applications';
    }

    async uploadImage(file) {
        try {
            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Tipo de archivo no permitido');
            }

            // Validar tamaño (10MB máximo)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                throw new Error('Archivo muy grande (máximo 10MB)');
            }

            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const filePath = `photos/${fileName}`;

            const response = await fetch(`${this.url}/storage/v1/object/${this.bucket}/${filePath}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'apikey': this.anonKey
                },
                body: file
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al subir imagen');
            }

            const publicUrl = `${this.url}/storage/v1/object/public/${this.bucket}/${filePath}`;
            
            return {
                url: publicUrl,
                path: filePath,
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

    async deleteImage(filePath) {
        try {
            const response = await fetch(`${this.url}/storage/v1/object/${this.bucket}/${filePath}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'apikey': this.anonKey
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar imagen');
            }

            return true;
        } catch (error) {
            console.error('Error en deleteImage:', error);
            throw error;
        }
    }
}

// Instancia global
const supabaseStorage = new SupabaseStorage();
