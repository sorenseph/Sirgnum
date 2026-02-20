-- Ejecutar en Supabase SQL Editor para publicar todos los reportes diarios existentes
-- Útil cuando la lista /reportes-diarios aparece vacía
UPDATE public.daily_reports SET is_published = true WHERE is_published = false;
