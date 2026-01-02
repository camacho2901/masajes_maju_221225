# Variables de Entorno - Producción

## Supabase
```javascript
URL: https://mmfdmqyrkfcsayrjbiml.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZmRtcXlya2Zjc2F5cmpiaW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDU5NzAsImV4cCI6MjA1MTA4MTk3MH0.sb_publishable_5Krtx0RKThinc5lTEbwC_A_U8WxxRvg
STORAGE_BUCKET: masaje-placer
```

## Google Analytics
```
TRACKING_ID: G-3NP3W3VZ09
```

## Admin
```
PASSWORD: Maju@2026
```

## Contacto
```
WHATSAPP: +591 69245670
ADDRESS: Av. Brasil #692, Santa Cruz, Bolivia
GOOGLE_MAPS: https://maps.app.goo.gl/BUydWQ51eADdXeKfA
```

## Desarrollador
```
COMPANY: Vision Digital
WHATSAPP: +591 69877877
```

## Notas de Seguridad
- La contraseña admin está hardcoded en admin.js línea 56
- El anonKey de Supabase es público (diseñado para uso en frontend)
- Las políticas RLS están desactivadas en la tabla applications
- El bucket de storage es público para permitir visualización de imágenes

## Cambiar Contraseña Admin
1. Abrir `js/admin.js`
2. Buscar línea: `if (password === 'Maju@2026')`
3. Cambiar 'Maju@2026' por nueva contraseña
4. Guardar y redesplegar

## Rotar Credenciales Supabase
1. Ir a Supabase Dashboard
2. Settings → API
3. Regenerar anon key si es necesario
4. Actualizar en `js/config.js`
5. Redesplegar sitio
