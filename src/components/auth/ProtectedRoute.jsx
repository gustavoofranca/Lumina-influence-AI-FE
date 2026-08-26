import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

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

  return isAuthenticated ? children : <Navigate to="/login" replace />
}
