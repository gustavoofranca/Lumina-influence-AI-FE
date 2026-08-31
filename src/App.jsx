import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider }  from './context/AuthContext.jsx'
import ProtectedRoute    from './components/auth/ProtectedRoute.jsx'
import RouteTransition from './components/layout/RouteTransition.jsx'
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
const PrimeiroAcesso   = lazy(() => import('./pages/PrimeiroAcesso.jsx'))
const Dashboard        = lazy(() => import('./pages/Dashboard.jsx'))
const Influenciadores  = lazy(() => import('./pages/Influenciadores.jsx'))
const Influenciador    = lazy(() => import('./pages/Influenciador.jsx'))
const Campanhas        = lazy(() => import('./pages/Campanhas.jsx'))
const Campanha         = lazy(() => import('./pages/Campanha.jsx'))
const NovaCampanha     = lazy(() => import('./pages/NovaCampanha.jsx'))
const Diagnostico      = lazy(() => import('./pages/Diagnostico.jsx'))
const Relatorios       = lazy(() => import('./pages/Relatorios.jsx'))
const NovoRelatorio    = lazy(() => import('./pages/NovoRelatorio.jsx'))
const Configuracoes    = lazy(() => import('./pages/Configuracoes.jsx'))
const Welcome          = lazy(() => import('./pages/Welcome.jsx'))
const DesignSystem     = lazy(() => import('./pages/DesignSystem.jsx'))
const NotFound         = lazy(() => import('./pages/NotFound.jsx'))

/** Exibido enquanto o chunk da rota carrega. */
function RouteFallback() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        role="status"
        aria-label={t('common.a11y.loading')}
        className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
      />
    </div>
  )
}

/** AnimatedRoutes — tabela de rotas envolvida pela transição de seção. */
function AnimatedRoutes() {
  return (
    <RouteTransition>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Público */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/auth/callback"   element={<AuthCallback />} />
          <Route
            path="/primeiro-acesso"
            element={<ProtectedRoute><PrimeiroAcesso /></ProtectedRoute>}
          />
          <Route path="/cadastro"        element={<Cadastro />} />

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
            <Route path="diagnostico"   element={<Diagnostico />} />
            <Route path="relatorios"    element={<Relatorios />} />
            <Route path="relatorios/novo" element={<NovoRelatorio />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="configuracoes/:tab" element={<Configuracoes />} />
          </Route>

          {/* Utilitários */}
          <Route path="/welcome"       element={<Welcome />} />
          <Route path="/design-system" element={<DesignSystem />} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </RouteTransition>
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
