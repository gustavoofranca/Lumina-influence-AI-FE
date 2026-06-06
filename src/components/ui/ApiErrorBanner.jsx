import { AlertTriangle } from 'lucide-react'

/** Banner simples de erro de API. Não renderiza nada se não houver erro. */
export default function ApiErrorBanner({ error, className = '' }) {
  if (!error) return null
  const msg = error.message || 'Falha ao carregar dados da API.'
  const hint = error.code === 'network_error'
    ? ' Verifique se o back-end está rodando em localhost:5000.'
    : ''
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-tertiary-500/30 bg-tertiary-500/10 px-4 py-3 ${className}`}>
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-tertiary-300" />
      <p className="text-sm text-tertiary-200">{msg}{hint}</p>
    </div>
  )
}
