// Servicio de Supabase (solo datos)
class SupabaseService {
    constructor() {
        this.url = CONFIG.supabase.url;
        this.key = CONFIG.supabase.anonKey;
        this.tableName = 'applications';
    }

    getHeaders() {
        return {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    async createApplication(data) {
        try {
            const response = await fetch(`${this.url}/rest/v1/${this.tableName}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    nombre: data.artisticName,
                    telefono: data.phone,
                    email: data.email || '',
                    edad: parseInt(data.age),
                    categoria: data.category,
                    descripcion: data.description || '',
                    experiencia: data.experience || '',
                    disponibilidad: data.availability || '',
                    ubicacion: data.location || '',
                    habilidades: data.skills || '',
                    instagram: data.instagram || '',
                    tiktok: data.tiktok || '',
                    estado: 'new',
                    rating: 0,
                    fecha: new Date().toISOString(),
                    imagenes: data.images || []
                })
            });

            if (!response.ok) throw new Error('Error al crear aplicación');
            return await response.json();
        } catch (error) {
            console.error('Error en createApplication:', error);
            throw error;
        }
    }

    async getApplications(filters = {}) {
        try {
            let url = `${this.url}/rest/v1/${this.tableName}?select=*`;
            
            if (filters.status) {
                url += `&estado=eq.${filters.status}`;
            }
            if (filters.category) {
                url += `&categoria=eq.${filters.category}`;
            }

            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Error al obtener aplicaciones');
            return await response.json();
        } catch (error) {
            console.error('Error en getApplications:', error);
            throw error;
        }
    }

    async updateApplication(id, data) {
        try {
            const response = await fetch(`${this.url}/rest/v1/${this.tableName}?id=eq.${id}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al actualizar aplicación');
            return await response.json();
        } catch (error) {
            console.error('Error en updateApplication:', error);
            throw error;
        }
    }

    async deleteApplication(id) {
        try {
            const response = await fetch(`${this.url}/rest/v1/${this.tableName}?id=eq.${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Error al eliminar aplicación');
            return true;
        } catch (error) {
            console.error('Error en deleteApplication:', error);
            throw error;
        }
    }

    async getApprovedProfiles() {
        try {
            const url = `${this.url}/rest/v1/${this.tableName}?estado=eq.approved&select=*`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Error al obtener perfiles');
            return await response.json();
        } catch (error) {
            console.error('Error en getApprovedProfiles:', error);
            throw error;
        }
    }

    async updateStatus(id, status) {
        return this.updateApplication(id, { estado: status });
    }

    async updateRating(id, rating) {
        return this.updateApplication(id, { rating: rating });
    }

    async addNotes(id, notes) {
        return this.updateApplication(id, { notas: notes });
    }
}

// Instancia global
const supabaseService = new SupabaseService();
const airtableService = supabaseService; // Alias para compatibilidad
