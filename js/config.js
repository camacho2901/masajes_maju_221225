// Configuración de APIs
const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://mmfdmqyrkfcsayrjbiml.supabase.co',
        anonKey: 'sb_publishable_5Krtx0RKThinc5lTEbwC_A_U8WxxRvg',
        enabled: true,
        storageBucket: 'masaje-placer'
    },
    
    // Backblaze B2 Configuration (deshabilitado)
    backblaze: {
        enabled: false
    },
    
    // Modo Demo
    demoMode: false,
    
    // Admin password hash (usar bcrypt en producción)
    adminPasswordHash: 'Maju@2026' // CAMBIAR: Usar hash seguro
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}