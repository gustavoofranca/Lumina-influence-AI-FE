import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Badge from '../ui/Badge.jsx'
import { ROLE_KEYS } from '../../lib/constants.js'

const ROLE_VARIANT = {
  admin:  'organic',
  member: 'paid',
  viewer: 'neutral',
}

/**
 * Papel do membro, agora editável.
 *
 * `updateMemberRole` existia em `services/team.js` desde a B4 e nenhuma tela o
 * importava: a coluna mostrava o papel como distintivo de leitura, e a única
 * forma de corrigir um convite feito com o papel errado era remover a pessoa e
 * convidá-la de novo.
 *
 * Só admin edita — é o que `PATCH /users/{id}` exige —, e quem não é vê o
 * distintivo de sempre. A guarda do último administrador é do back-end
 * (`last_admin_role_change`): formulário desabilitado não é regra, é sugestão.
 *
 * Segue o mesmo padrão de menu do status do criador, com `listbox` e
 * `aria-expanded`.
 */
export default function PapelDoMembro({ valor, onChange, editavel, salvando = false }) {
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

  const rotulo = t(`configuracoes.equipe.roles.${valor}`, valor)

  if (!editavel) {
    return <Badge variant={ROLE_VARIANT[valor]} uppercase={false}>{rotulo}</Badge>
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((p) => !p)}
        disabled={salvando}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={t('configuracoes.equipe.roleLabel', { nome: rotulo })}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors',
          'ring-1 ring-inset ring-transparent hover:ring-hairline disabled:opacity-60',
          aberto && 'ring-2 ring-primary-500'
        )}
      >
        <Badge variant={ROLE_VARIANT[valor]} uppercase={false}>
          {salvando ? t('configuracoes.equipe.roleSaving') : rotulo}
        </Badge>
        <ChevronDown
          size={12}
          className={cn('text-text-muted transition-transform', aberto && 'rotate-180')}
        />
      </button>

      {aberto && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 mt-2 min-w-[180px] rounded-superficie border border-[color:var(--border-subtle)] bg-bg-surface p-1.5 shadow-2"
        >
          {ROLE_KEYS.map((opcao) => (
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
                <span>{t(`configuracoes.equipe.roles.${opcao}`)}</span>
                {opcao === valor && <Check size={14} className="shrink-0 text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
