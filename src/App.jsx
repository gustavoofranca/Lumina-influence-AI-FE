import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

import { AuthProvider }  from './context/AuthContext.jsx'
import ProtectedRoute    from './components/auth/ProtectedRoute.jsx'
import AppLayout         from './layouts/AppLayout.jsx'

import LandingPage    from './pages/LandingPage.jsx'
import Welcome        from './pages/Welcome.jsx'
import DesignSystem   from './pages/DesignSystem.jsx'
import Login          from './pages/Login.jsx'
import AuthCallback    from './pages/AuthCallback.jsx'
import Cadastro       from './pages/Cadastro.jsx'
import RecuperarSenha from './pages/RecuperarSenha.jsx'
import Dashboard      from './pages/Dashboard.jsx'
import Influenciadores from './pages/Influenciadores.jsx'
import Influenciador  from './pages/Influenciador.jsx'
import Campanhas      from './pages/Campanhas.jsx'
import Campanha       from './pages/Campanha.jsx'
import NovaCampanha   from './pages/NovaCampanha.jsx'
import Relatorios     from './pages/Relatorios.jsx'
import NovoRelatorio  from './pages/NovoRelatorio.jsx'
import Configuracoes  from './pages/Configuracoes.jsx'
import NotFound       from './pages/NotFound.jsx'

// Placeholders das rotas que ainda nao tem tela dedicada
function Placeholder({ label }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-text-muted">{label} — em breve</p>
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
