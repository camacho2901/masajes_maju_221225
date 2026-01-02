# Masaje y Placer Maju - Sitio Web Oficial

## 🌟 Descripción
Sitio web profesional para servicios de masajes exclusivos en Santa Cruz, Bolivia.

## 🚀 Características
- ✅ Diseño minimalista profesional con tema dorado
- ✅ Sistema de verificación de edad
- ✅ Galería de masajistas con fotos
- ✅ Formulario de aplicación en 4 pasos
- ✅ Panel administrativo completo
- ✅ Métricas avanzadas en tiempo real
- ✅ Integración con Supabase Storage
- ✅ Google Analytics integrado
- ✅ Responsive design

## 📋 Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet para Supabase y Google Analytics

## 🔧 Configuración

### Supabase
1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear proyecto nuevo
3. Crear bucket de storage: `masaje-placer` (público)
4. Crear tabla `applications` con columnas:
   - id (uuid, primary key)
   - name (text)
   - age (int4)
   - phone (text)
   - instagram (text)
   - location (text)
   - category (text)
   - photos (text[])
   - status (text, default: 'pending')
   - created_at (timestamptz, default: now())
5. Desactivar RLS en la tabla: `ALTER TABLE applications DISABLE ROW LEVEL SECURITY;`
6. Actualizar credenciales en `js/config.js`

### Google Analytics
- ID configurado: G-3NP3W3VZ09
- Actualizar en todas las páginas HTML si es necesario

## 📁 Estructura del Proyecto
```
masaje_maju/
├── index.html          # Página principal
├── gallery.html        # Galería de masajistas
├── apply.html          # Formulario de aplicación
├── admin.html          # Panel administrativo
├── css/
│   ├── main.css       # Estilos principales
│   └── animations.css # Animaciones
├── js/
│   ├── app.js         # Funcionalidad general
│   ├── gallery.js     # Galería
│   ├── apply.js       # Formulario
│   ├── admin.js       # Panel admin
│   ├── config.js      # Configuración
│   ├── supabase-storage.js  # Upload imágenes
│   └── supabase-service.js  # API Supabase
├── data/
│   └── profiles.json  # Datos iniciales
└── assets/
    └── images/        # Imágenes del sitio
```

## 🔐 Acceso Administrativo
- URL: `/admin.html`
- Contraseña: `Maju@2026`

## 📊 Panel Administrativo

### Pestañas
1. **Personal Activo**: Gestión de masajistas activas
2. **Solicitudes**: Revisar, aprobar o rechazar aplicaciones
3. **Estadísticas**: Gráficos y métricas básicas
4. **Métricas Avanzadas**: KPIs y análisis detallado
5. **Configuración**: Ajustes del sitio

### Métricas Avanzadas
- Tasa de conversión
- Tasa de aprobación
- Tiempo de respuesta promedio
- Solicitudes pendientes
- Timeline de solicitudes (30 días)
- Estado de solicitudes (gráfico)
- Tabla de rendimiento del personal

## 📱 Contacto
- WhatsApp: +591 69245670
- Dirección: Av. Brasil #692, Santa Cruz, Bolivia
- Horario: Lun-Dom 10:00 AM - 10:00 PM

## 🛠️ Desarrollo
- Diseño: Vision Digital
- WhatsApp: +591 69877877

## 📝 Notas de Producción
- Todas las imágenes se suben a Supabase Storage
- Los datos se persisten en localStorage y Supabase
- El sitio es completamente funcional sin backend adicional
- Compatible con GitHub Pages

## 🔄 Actualizaciones
- v1.0.0 (Enero 2026): Lanzamiento inicial
- Métricas avanzadas implementadas
- Sistema de gestión completo

## 📄 Licencia
© 2026 Masaje y Placer Maju. Todos los derechos reservados.
