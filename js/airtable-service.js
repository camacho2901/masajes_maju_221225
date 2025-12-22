// Servicio de Airtable
class AirtableService {
    constructor() {
        this.apiKey = CONFIG.airtable.apiKey;
        this.baseId = CONFIG.airtable.baseId;
        this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;
    }

    // Headers para requests
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    // Crear aplicación
    async createApplication(data) {
        try {
            const response = await fetch(`${this.baseUrl}/${CONFIG.airtable.tables.applications}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    fields: {
                        'Nombre': data.artisticName,
                        'Email': data.email,
                        'Edad': parseInt(data.age),
                        'Categoria': data.category,
                        'Descripcion': data.description || '',
                        'Experiencia': data.experience || '',
                        'Disponibilidad': data.availability || '',
                        'Ubicacion': data.location || '',
                        'Habilidades': data.skills || '',
                        'Instagram': data.instagram || '',
                        'TikTok': data.tiktok || '',
                        'Estado': 'new',
                        'Rating': 0,
                        'Fecha': new Date().toISOString(),
                        'Imagenes': data.images || []
                    }
                })
            });

            if (!response.ok) throw new Error('Error al crear aplicación');
            return await response.json();
        } catch (error) {
            console.error('Error en createApplication:', error);
            throw error;
        }
    }

    // Obtener todas las aplicaciones
    async getApplications(filters = {}) {
        try {
            let url = `${this.baseUrl}/${CONFIG.airtable.tables.applications}`;
            
            // Agregar filtros si existen
            const params = new URLSearchParams();
            if (filters.status) {
                params.append('filterByFormula', `{Estado}='${filters.status}'`);
            }
            if (filters.category) {
                params.append('filterByFormula', `{Categoria}='${filters.category}'`);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Error al obtener aplicaciones');
            const data = await response.json();
            return data.records;
        } catch (error) {
            console.error('Error en getApplications:', error);
            throw error;
        }
    }

    // Actualizar aplicación
    async updateApplication(recordId, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${CONFIG.airtable.tables.applications}/${recordId}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    fields: data
                })
            });

            if (!response.ok) throw new Error('Error al actualizar aplicación');
            return await response.json();
        } catch (error) {
            console.error('Error en updateApplication:', error);
            throw error;
        }
    }

    // Eliminar aplicación
    async deleteApplication(recordId) {
        try {
            const response = await fetch(`${this.baseUrl}/${CONFIG.airtable.tables.applications}/${recordId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Error al eliminar aplicación');
            return await response.json();
        } catch (error) {
            console.error('Error en deleteApplication:', error);
            throw error;
        }
    }

    // Obtener perfiles aprobados
    async getApprovedProfiles() {
        try {
            const url = `${this.baseUrl}/${CONFIG.airtable.tables.applications}?filterByFormula={Estado}='approved'`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Error al obtener perfiles');
            const data = await response.json();
            return data.records;
        } catch (error) {
            console.error('Error en getApprovedProfiles:', error);
            throw error;
        }
    }

    // Actualizar estado
    async updateStatus(recordId, status) {
        return this.updateApplication(recordId, { 'Estado': status });
    }

    // Actualizar rating
    async updateRating(recordId, rating) {
        return this.updateApplication(recordId, { 'Rating': rating });
    }

    // Agregar notas
    async addNotes(recordId, notes) {
        return this.updateApplication(recordId, { 'Notas': notes });
    }
}

// Instancia global
const airtableService = new AirtableService();