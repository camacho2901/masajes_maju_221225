// Configuración de APIs
const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://mmfdmqyrkfcsayrjbiml.supabase.co',
        anonKey: 'sb_publishable_5Krtx0RKThinc5lTEbwC_A_U8WxxRvg',
        enabled: true,
        storageBucket: 'masaje-placer'
    },
    
    // Backblaze B2 Configuration (deshabilitado, usamos Supabase Storage)
    backblaze: {
        keyId: '005c491b6124f930000000007',
        applicationKey: 'K005vObWNJFZEPxN7CoJRKRzbJL4lWY',
        bucketId: '4c84e9a19bd6413294bf0913',
        bucketName: 'masaje-maju',
        enabled: false
    },
    
    // Modo Demo
    demoMode: false
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}