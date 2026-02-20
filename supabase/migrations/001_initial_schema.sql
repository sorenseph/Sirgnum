-- ============================================
-- SIGNUM RESEARCH - Esquema de Base de Datos
-- ============================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ROLES: super_admin, admin, editor, reader
-- ============================================

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'reader');

-- ============================================
-- Perfiles de usuario (extiende auth.users)
-- ============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'reader',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  can_read BOOLEAN DEFAULT false,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Login social (para vincular proveedores)
-- ============================================

CREATE TABLE public.user_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'facebook'
  provider_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider, provider_user_id)
);

-- ============================================
-- Categorías de notas
-- ============================================

CREATE TYPE note_category AS ENUM (
  'equity',
  'fibras',
  'economicos',
  'sectoriales',
  'especiales',
  'nota_tecnica'
);

-- ============================================
-- Notas (del editor)
-- ============================================

CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  header_image_url TEXT,
  category note_category NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Imágenes dentro del contenido de notas
-- ============================================

CREATE TABLE public.note_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  position_order INT DEFAULT 0,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Preguntas del formulario del reporte diario
-- ============================================

CREATE TABLE public.report_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_key TEXT UNIQUE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'text', 'number', 'select', 'multi_select'
  options JSONB,
  required BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Reportes diarios
-- ============================================

CREATE TABLE public.daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  report_date DATE NOT NULL,
  form_responses JSONB, -- Respuestas del formulario
  diagram_config JSONB, -- Config para diagramas basados en respuestas
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Imágenes del reporte diario
-- ============================================

CREATE TABLE public.report_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  position_order INT DEFAULT 0,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Clientes exclusivos (para reportes con branding)
-- ============================================

CREATE TABLE public.report_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color_hex TEXT DEFAULT '#004d40',
  secondary_color_hex TEXT DEFAULT '#00cca0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Relación: reportes exclusivos por cliente
-- ============================================

CREATE TABLE public.report_client_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.report_clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(report_id, client_id)
);

-- ============================================
-- Acceso de lectores a notas/publicaciones
-- ============================================

CREATE TABLE public.reader_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(reader_id, note_id)
);

-- Índices para performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_notes_category ON public.notes(category);
CREATE INDEX idx_notes_created ON public.notes(created_at DESC);
CREATE INDEX idx_daily_reports_date ON public.daily_reports(report_date DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER daily_reports_updated_at BEFORE UPDATE ON public.daily_reports
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER report_clients_updated_at BEFORE UPDATE ON public.report_clients
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Función para crear perfil al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_client_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reader_access ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','admin'))
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','admin'))
  );

-- Notas
CREATE POLICY "Authenticated can read published notes" ON public.notes
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      is_published = true OR 
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','admin','editor'))
    )
  );

CREATE POLICY "Editors can manage notes" ON public.notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','admin','editor'))
  );

-- Reportes diarios
CREATE POLICY "Editors can manage daily_reports" ON public.daily_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','admin','editor'))
  );

CREATE POLICY "Authenticated can read published reports" ON public.daily_reports
  FOR SELECT USING (
    is_published = true OR 
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','admin','editor'))
  );

-- Clientes reporte
CREATE POLICY "Editors can manage report_clients" ON public.report_clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin','admin','editor'))
  );
