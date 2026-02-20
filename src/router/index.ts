import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ReportsView from '../views/ReportsView.vue'
import ContactView from '../views/ContactView.vue'
import ServicesView from '../views/ServicesView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/confirmacion',
      name: 'confirmacion',
      component: () => import('../views/ConfirmacionView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: ReportsView,
    },
    {
      path: '/reportes-diarios',
      name: 'reportes-diarios',
      component: () => import('../views/DailyReportsListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reporte-diario/:id',
      name: 'reporte-diario',
      component: () => import('../views/DailyReportView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reportes/:id',
      name: 'reporte-detalle',
      component: () => import('../views/ReportDetailView.vue'),
    },
    {
      path: '/contacto',
      name: 'contacto',
      component: ContactView,
    },
    {
      path: '/servicios',
      name: 'servicios',
      component: ServicesView,
    },
    {
      path: '/mercados',
      name: 'mercados',
      component: () => import('../views/public/MercadosView.vue'),
    },
    {
      path: '/mercados/bolsa-de-hoy',
      name: 'bolsa-hoy',
      component: () => import('../views/public/BolsaHoyView.vue'),
    },
    {
      path: '/mercados/industrias-y-empresas',
      name: 'industrias',
      component: () => import('../views/public/IndustriasView.vue'),
    },
    {
      path: '/mercados/recomendaciones',
      name: 'recomendaciones',
      component: () => import('../views/public/RecomendacionesView.vue'),
    },
    {
      path: '/mercados/divisas',
      name: 'divisas',
      component: () => import('../views/public/DivisasView.vue'),
    },
    {
      path: '/analistas',
      name: 'analistas',
      component: () => import('../views/public/AnalistasView.vue'),
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          redirect: { name: 'admin-notes' },
        },
        {
          path: 'notas',
          name: 'admin-notes',
          component: () => import('../views/admin/AdminNotesView.vue'),
          meta: { requiresEditor: true, title: 'Notas' },
        },
        {
          path: 'reportes-diarios',
          name: 'admin-daily-reports',
          component: () => import('../views/admin/AdminDailyReportsView.vue'),
          meta: { requiresEditor: true, title: 'Reportes Diarios' },
        },
        {
          path: 'usuarios',
          name: 'admin-users',
          component: () => import('../views/admin/AdminUsersView.vue'),
          meta: { requiresUserManagement: true, title: 'Usuarios' },
        },
        {
          path: 'clientes-reporte',
          name: 'admin-report-clients',
          component: () => import('../views/admin/AdminReportClientsView.vue'),
          meta: { requiresEditor: true, title: 'Clientes Reporte' },
        },
        {
          path: 'recomendaciones',
          name: 'admin-recommendations',
          component: () => import('../views/admin/AdminRecommendationsView.vue'),
          meta: { requiresEditor: true, title: 'Recomendaciones' },
        },
        {
          path: 'analistas',
          name: 'admin-analysts',
          component: () => import('../views/admin/AdminAnalystsView.vue'),
          meta: { requiresEditor: true, title: 'Analistas' },
        },
      ],
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return savedPosition ?? { top: 0 }
  },
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()

  // Esperar a que auth termine de inicializar para evitar redirecciones incorrectas tras login
  if (auth.loading) {
    await new Promise<void>((resolve) => {
      const stop = watch(
        () => auth.loading,
        (loading) => { if (!loading) { stop(); resolve() } },
        { immediate: true }
      )
      // Timeout de seguridad: si carga más de 8s, continuar de todos modos
      setTimeout(() => { stop(); resolve() }, 8000)
    })
  }

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin)
  const requiresEditor = to.matched.some((r) => r.meta.requiresEditor)
  const requiresUserManagement = to.matched.some(
    (r) => r.meta.requiresUserManagement
  )
  const guest = to.matched.some((r) => r.meta.guest)

  if (guest && auth.isAuthenticated) {
    return next({ name: 'admin-dashboard' })
  }

  if (requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (requiresAdmin && !auth.canAccessAdmin) {
    return next({ name: 'home' })
  }

  if (requiresEditor && !auth.isEditor) {
    return next({ name: 'admin-dashboard' })
  }

  if (requiresUserManagement && !auth.canManageUsers) {
    return next({ name: 'admin-dashboard' })
  }

  next()
})

export default router
