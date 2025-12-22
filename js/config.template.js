// Configuración de APIs - TEMPLATE
// Copiar este archivo como config.js y agregar tus credenciales

const CONFIG = {
    // Airtable Configuration
    // Obtener en: https://airtable.com/account
    airtable: {
        apiKey: 'TU_AIRTABLE_API_KEY', // ← Reemplazar
        baseId: 'TU_AIRTABLE_BASE_ID', // ← Reemplazar
        tables: {
            applications: 'Applications',
            profiles: 'Profiles',
            messages: 'Messages'
        }
    },
    
    // Imgur Configuration
    // Obtener en: https://api.imgur.com/oauth2/addclient
    imgur: {
        clientId: 'TU_IMGUR_CLIENT_ID', // ← Reemplazar
        uploadEndpoint: 'https://api.imgur.com/3/image'
    },
    
    // EmailJS Configuration (opcional)
    // Obtener en: https://www.emailjs.com
    emailjs: {
        serviceId: 'TU_SERVICE_ID',
        templateId: 'TU_TEMPLATE_ID',
        publicKey: 'TU_PUBLIC_KEY'
    }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// INSTRUCCIONES:
// 1. Copiar este archivo como config.js
// 2. Reemplazar los valores TU_* con tus credenciales reales
// 3. NO subir config.js a GitHub (está en .gitignore)
// 4. Ver BACKEND_SETUP.md para guía completa