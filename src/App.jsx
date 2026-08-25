import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

import { AuthProvider }  from './context/AuthContext.jsx'
import ProtectedRoute    from './components/auth/ProtectedRoute.jsx'
import AppLayout         from './layouts/AppLayout.jsx'

// Entradas públicas ficam no bundle inicial: são o primeiro paint e carregar
// sob demanda causaria um flash de spinner na abertura.
import LandingPage from './pages/LandingPage.jsx'
import Login       from './pages/Login.jsx'

/**
 * O resto das telas entra por code splitting. O peso está no app interno
 * (gráficos, tabelas, wizards) — quem chega na landing não precisa baixar
 * nada disso.
 */
const AuthCallback     = lazy(() => import('./pages/AuthCallback.jsx'))
const Cadastro         = lazy(() => import('./pages/Cadastro.jsx'))
const RecuperarSenha   = lazy(() => import('./pages/RecuperarSenha.jsx'))
const Dashboard        = lazy(() => import('./pages/Dashboard.jsx'))
const Influenciadores  = lazy(() => import('./pages/Influenciadores.jsx'))
const Influenciador    = lazy(() => import('./pages/Influenciador.jsx'))
const Campanhas        = lazy(() => import('./pages/Campanhas.jsx'))
const Campanha         = lazy(() => import('./pages/Campanha.jsx'))
const NovaCampanha     = lazy(() => import('./pages/NovaCampanha.jsx'))
const Relatorios       = lazy(() => import('./pages/Relatorios.jsx'))
const NovoRelatorio    = lazy(() => import('./pages/NovoRelatorio.jsx'))
const Configuracoes    = lazy(() => import('./pages/Configuracoes.jsx'))
const Welcome          = lazy(() => import('./pages/Welcome.jsx'))
const DesignSystem     = lazy(() => import('./pages/DesignSystem.jsx'))
const NotFound         = lazy(() => import('./pages/NotFound.jsx'))

// Placeholders das rotas que ainda nao tem tela dedicada
function Placeholder({ label }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-text-muted">{label} — em breve</p>
    </div>
  )
}

/** Exibido enquanto o chunk da rota carrega. */
function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        role="status"
        aria-label="Carregando"
        className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
      />
    </div>
  )
}

/**
 * AnimatedRoutes — wrapper que re-monta a subarvore de rotas a cada
 * navegacao para acionar a animacao fade-in via key={pathname}.
 *
 * Usa o segmento "raiz" da URL como chave (ex: /app/dashboard ->
 * "/app") para nao re-acionar a transicao quando apenas o path interno
 * de uma area muda — apenas em mudancas reais de "secao".
 */
function AnimatedRoutes() {
  const location = useLocation()
  const sectionKey = location.pathname.split('/').slice(0, 3).join('/') || '/'

  return (
    <div key={sectionKey} className="animate-fade-in">
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Público */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/auth/callback"   element={<AuthCallback />} />
          <Route path="/cadastro"        element={<Cadastro />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />

          {/* App interno — protegido + AppLayout */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index                element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="influenciadores"  element={<Influenciadores />} />
            <Route path="influenciadores/:id" element={<Influenciador />} />
            <Route path="campanhas"     element={<Campanhas />} />
            <Route path="campanhas/nova" element={<NovaCampanha />} />
            <Route path="campanhas/:id" element={<Campanha />} />
            <Route path="diagnostico"   element={<Placeholder label="Diagnóstico IA" />} />
            <Route path="relatorios"    element={<Relatorios />} />
            <Route path="relatorios/novo" element={<NovoRelatorio />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="configuracoes/:tab" element={<Configuracoes />} />
            <Route path="suporte"       element={<Placeholder label="Suporte" />} />
          </Route>

          {/* Utilitários */}
          <Route path="/welcome"       element={<Welcome />} />
          <Route path="/design-system" element={<DesignSystem />} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
