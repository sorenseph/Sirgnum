import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Montar la app de inmediato para evitar pantalla en blanco; auth se inicializa en paralelo
app.mount('#app')

router.isReady().then(async () => {
  const auth = useAuthStore()
  await auth.init()
})
