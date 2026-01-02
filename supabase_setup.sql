-- Tabla para configuración del sitio (contador de visitas, etc.)
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar contador inicial
INSERT INTO site_config (key, value) VALUES ('total_visits', '0')
ON CONFLICT (key) DO NOTHING;

-- Tabla para personal activo (masajistas)
CREATE TABLE IF NOT EXISTS staff (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  photo TEXT,
  category TEXT DEFAULT 'tantrico',
  experience TEXT,
  description TEXT,
  avatar TEXT DEFAULT '—',
  location TEXT DEFAULT 'Santa Cruz, Bolivia',
  availability TEXT DEFAULT 'full-time',
  featured BOOLEAN DEFAULT true,
  tags TEXT[],
  rating NUMERIC DEFAULT 5.0,
  date_joined TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desactivar RLS en todas las tablas
ALTER TABLE site_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_staff_category ON staff(category);
CREATE INDEX IF NOT EXISTS idx_staff_availability ON staff(availability);
