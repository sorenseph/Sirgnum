-- Agregar client_id a daily_reports (ejecutar en SQL Editor si el error PGRST204 persiste)
ALTER TABLE public.daily_reports 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.report_clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_daily_reports_client ON public.daily_reports(client_id);
