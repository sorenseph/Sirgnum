-- Corrige recursión infinita en políticas RLS de profiles
-- Las políticas que hacían SELECT en profiles para verificar el rol causaban recursión

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can read published notes" ON public.notes;
DROP POLICY IF EXISTS "Editors can manage notes" ON public.notes;
DROP POLICY IF EXISTS "Editors can manage daily_reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Authenticated can read published reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Editors can manage report_clients" ON public.report_clients;

CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (get_my_role() IN ('super_admin', 'admin'));

CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (get_my_role() IN ('super_admin', 'admin'));

CREATE POLICY "Authenticated can read published notes" ON public.notes
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      is_published = true OR get_my_role() IN ('super_admin', 'admin', 'editor')
    )
  );

CREATE POLICY "Editors can manage notes" ON public.notes
  FOR ALL USING (get_my_role() IN ('super_admin', 'admin', 'editor'));

CREATE POLICY "Editors can manage daily_reports" ON public.daily_reports
  FOR ALL USING (get_my_role() IN ('super_admin', 'admin', 'editor'));

CREATE POLICY "Authenticated can read published reports" ON public.daily_reports
  FOR SELECT USING (
    is_published = true OR get_my_role() IN ('super_admin', 'admin', 'editor')
  );

CREATE POLICY "Editors can manage report_clients" ON public.report_clients
  FOR ALL USING (get_my_role() IN ('super_admin', 'admin', 'editor'));
