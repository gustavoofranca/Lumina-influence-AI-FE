import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Download } from 'lucide-react'

import Button from '../ui/Button.jsx'
import { cn } from '../../lib/cn.js'

/**
 * Os códigos de recuperação do 2FA, mostrados **uma vez só**: a API guarda só
 * o hash deles. Por isso o botão de seguir fica travado até a pessoa marcar
 * que guardou — perder o celular sem os códigos é ficar sem a conta.
 */
export default function CodigosDeRecuperacao({ codigos, onContinuar, vidro = false, rotuloContinuar }) {
  const { t } = useTranslation()
  const [guardou, setGuardou] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const texto = codigos.join('\n')

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
    } catch {
      // Sem permissão de área de transferência: o download continua disponível.
      setCopiado(false)
    }
  }

  const baixar = () => {
    const conteudo = `${t('auth.mfa.recovery.fileHeader')}\n\n${texto}\n`
    const url = URL.createObjectURL(new Blob([conteudo], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'lumina-codigos-de-recuperacao.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className={cn('text-sm', vidro ? 'text-landing-muted' : 'text-text-secondary')}>
        {t('auth.mfa.recovery.explain')}
      </p>
      <ul
        aria-label={t('auth.mfa.recovery.listLabel')}
        className={cn(
          'grid grid-cols-2 gap-2 rounded-xl p-4 font-mono text-sm tracking-wider',
          vidro ? 'bg-white/5 text-white' : 'bg-bg-elevated text-text-primary'
        )}
      >
        {codigos.map((codigo) => <li key={codigo}>{codigo}</li>)}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={vidro ? 'vidro' : 'secondary'} leftIcon={Copy} onClick={copiar}>
          {copiado ? t('auth.mfa.recovery.copied') : t('auth.mfa.recovery.copy')}
        </Button>
        <Button type="button" size="sm" variant={vidro ? 'vidro' : 'secondary'} leftIcon={Download} onClick={baixar}>
          {t('auth.mfa.recovery.download')}
        </Button>
      </div>
      <label className={cn('flex items-start gap-2 text-sm', vidro ? 'text-white' : 'text-text-primary')}>
        <input
          type="checkbox"
          className="mt-0.5"
          checked={guardou}
          onChange={(e) => setGuardou(e.target.checked)}
        />
        <span>{t('auth.mfa.recovery.saved')}</span>
      </label>
      <Button
        type="button"
        variant={vidro ? 'vidro-primaria' : 'primary'}
        fullWidth={vidro}
        size={vidro ? 'lg' : 'md'}
        disabled={!guardou}
        onClick={onContinuar}
      >
        {rotuloContinuar ?? t('auth.mfa.recovery.continue')}
      </Button>
    </div>
  )
}
