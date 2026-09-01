import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import StatusIndicator from '../ui/StatusIndicator.jsx'
import { STATUS_VISUAIS } from '../../services/influencers.js'

const COR = { active: 'success', monitoring: 'warning', risk: 'danger' }

/**
 * Status do criador, agora editável.
 *
 * É um julgamento da agência — "ativo", "monitorar", "em risco" — e até aqui
 * vinha só do seed: aparecia no cabeçalho e ninguém podia mexer. Num produto
 * de auditoria esse é justamente o campo que o usuário precisa controlar.
 *
 * Segue o padrão de menu que o filtro do dashboard já usa, com `listbox` e
 * `aria-expanded`, para não inventar um terceiro jeito de fazer a mesma coisa.
 */
export default function StatusDoCriador({ valor, onChange, salvando = false }) {
  const { t } = useTranslation()
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const fora = (e) => { if (!ref.current?.contains(e.target)) setAberto(false) }
    const esc = (e) => { if (e.key === 'Escape') setAberto(false) }
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fora)
      document.removeEventListener('keydown', esc)
    }
  }, [aberto])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((p) => !p)}
        disabled={salvando}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={t('influenciador.header.statusLabel')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors',
          'ring-1 ring-inset ring-hairline hover:bg-bg-elevated disabled:opacity-60',
          aberto && 'ring-2 ring-primary-500'
        )}
      >
        <StatusIndicator
          label={t(salvando
            ? 'influenciador.header.statusSaving'
            : `influenciadores.status.${valor}`)}
          color={COR[valor] || 'success'}
        />
        <ChevronDown size={12} className={cn('text-text-muted transition-transform', aberto && 'rotate-180')} />
      </button>

      {aberto && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 mt-2 min-w-[180px] rounded-2xl border border-primary/15 bg-bg-surface p-1.5 shadow-glow-soft"
        >
          {STATUS_VISUAIS.map((opcao) => (
            <li key={opcao}>
              <button
                type="button"
                role="option"
                aria-selected={opcao === valor}
                onClick={() => { setAberto(false); if (opcao !== valor) onChange(opcao) }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                  opcao === valor
                    ? 'bg-primary-600/15 text-accent-strong'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                )}
              >
                <span>{t(`influenciadores.status.${opcao}`)}</span>
                {opcao === valor && <Check size={14} className="shrink-0 text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
