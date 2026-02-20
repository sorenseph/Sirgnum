-- Permitir que usuarios no autenticados lean notas publicadas (para preview en reportes)
DROP POLICY IF EXISTS "Authenticated can read published notes" ON public.notes;

CREATE POLICY "Public can read published notes" ON public.notes
  FOR SELECT USING (is_published = true);
