-- ===========================================
-- Crear Super Admin - Signum Research
-- ===========================================
--
-- IMPORTANTE: Ejecutar DESPUÉS de registrarte en /login
--
-- 1. Ve a http://localhost:5173/login
-- 2. Regístrate con email (ej: admin@signum.com)
-- 3. Luego ejecuta este SQL en Supabase → SQL Editor

-- Reemplaza con el email que usaste al registrarte
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'israelcardenas6@gmail.com';

-- Verificar: lista los usuarios y sus roles
-- SELECT id, email, full_name, role, is_active FROM public.profiles;
