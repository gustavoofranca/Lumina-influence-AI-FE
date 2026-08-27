import { AlertTriangle, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Button from './Button.jsx'

/**
 * Banner de erro de API. Não renderiza nada se não houver erro.
 *
 * Com `onRetry`, oferece a ação de tentar de novo — a Seção 7 exige que todo
 * estado de erro tenha uma, e sem ela a única saída do usuário era recarregar
 * a página inteira e perder o contexto da tela.
 */
export default function ApiErrorBanner({ error, onRetry, retrying = false, className = '' }) {
  const { t } = useTranslation()
  if (!error) return null

  const msg = error.message || t('common.apiError')
  const hint = error.code === 'network_error' ? ` ${t('common.apiErrorHint')}` : ''

  return (
    <div
      role="alert"
      className={`flex flex-wrap items-start gap-3 rounded-xl border border-tertiary-500/30 bg-tertiary-500/10 px-4 py-3 ${className}`}
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-tertiary-300" />
      <p className="min-w-0 flex-1 text-sm text-tertiary-200">{msg}{hint}</p>
      {onRetry && (
        <Button
          variant="outlined"
          size="sm"
          leftIcon={RotateCw}
          loading={retrying}
          onClick={onRetry}
        >
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}
