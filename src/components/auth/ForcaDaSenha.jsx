import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import { SENHA_MIN } from '../../lib/limites.js'
import { medirForca } from '../../lib/forcaDaSenha.js'

const COR_DA_NOTA = ['bg-tertiary-500', 'bg-tertiary-500', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-400']

/** Barra de força sob o campo de senha. `entradas`: e-mail e nome, que o zxcvbn penaliza. */
export default function ForcaDaSenha({ senha, entradas = [], variant = 'padrao' }) {
  const { t } = useTranslation()
  const [medida, setMedida] = useState({ senha: '', nota: null })
  const chave = entradas.filter(Boolean).join('|')

  useEffect(() => {
    if (!senha) return undefined
    let vivo = true
    const espera = setTimeout(() => {
      medirForca(senha, chave ? chave.split('|') : [])
        .then((nota) => { if (vivo) setMedida({ senha, nota }) })
        .catch(() => { if (vivo) setMedida({ senha, nota: null }) })
    }, 150)
    return () => {
      vivo = false
      clearTimeout(espera)
    }
  }, [senha, chave])

  if (!senha) return null
  const nota = medida.senha === senha ? medida.nota : null
  const curta = [...senha].length < SENHA_MIN

  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full',
              variant === 'vidro' ? 'bg-white/10' : 'bg-hairline',
              nota !== null && i < Math.max(nota, 1) && COR_DA_NOTA[nota]
            )}
          />
        ))}
      </div>
      <p
        className={cn('mt-1 text-xs', variant === 'vidro' ? 'text-landing-muted' : 'text-text-muted')}
        aria-live="polite"
      >
        {t('auth.senha.strengthLabel')}: {nota === null ? '…' : t(`auth.senha.strength.${nota}`)}
        {curta ? ` · ${t('auth.senha.strengthHint', { min: SENHA_MIN })}` : ''}
      </p>
    </div>
  )
}
