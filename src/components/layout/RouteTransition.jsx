import { useLocation } from 'react-router-dom'

/**
 * RouteTransition — aplica o fade-in ao trocar de seção do app.
 *
 * A chave é o **segmento raiz** da URL (`/app/influenciadores/:id` → `/app`),
 * não o caminho inteiro. A diferença importa: com o caminho inteiro, abrir um
 * criador a partir da listagem remontaria a subárvore e refaria todas as
 * requisições da tela — a animação cobraria uma ida ao servidor a cada clique.
 * Com o segmento raiz, o fade acontece só na troca real de seção.
 */
export default function RouteTransition({ children }) {
  const location = useLocation()
  const chaveDaSecao = location.pathname.split('/').slice(0, 3).join('/') || '/'

  return (
    <div key={chaveDaSecao} className="animate-fade-in">
      {children}
    </div>
  )
}
