-- Agregar client_id opcional a reportes diarios para branding (logo + colores)
ALTER TABLE public.daily_reports
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.report_clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_daily_reports_client ON public.daily_reports(client_id);

-- Permitir a usuarios autenticados leer clientes activos (para mostrar logo/colores en reportes)
CREATE POLICY "Authenticated can read active report_clients"
  ON public.report_clients
  FOR SELECT
  TO authenticated
  USING (is_active = true);
