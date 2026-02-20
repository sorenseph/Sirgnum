-- Permitir que usuarios no autenticados (anon) lean reportes diarios publicados
-- Igual que las notas (004): acceso público a contenido publicado
DROP POLICY IF EXISTS "Authenticated can read published reports" ON public.daily_reports;

CREATE POLICY "Public can read published daily reports" ON public.daily_reports
  FOR SELECT USING (is_published = true);
