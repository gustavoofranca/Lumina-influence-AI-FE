import { Navigate, useLocation } from 'react-router-dom'

import { precisaCompletarCadastro, useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user, agency } = useAuth()
  const { pathname } = useLocation()

  // Enquanto a sessao da aba esta sendo restaurada (ADR-001 revisada), ainda
  // nao se sabe se ha usuario: redirecionar aqui mandaria para o login todo
  // mundo que recarrega a pagina.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Todo cadastro tem CNPJ: o admin de uma agência sem ele (conta vinda do
  // Google, ou anterior a esta regra) completa no primeiro acesso, e não há
  // como pular. Membro e leitor não decidem isso e não são bloqueados.
  if (precisaCompletarCadastro(user, agency) && pathname !== '/primeiro-acesso') {
    return <Navigate to="/primeiro-acesso" replace />
  }

  return children
}
