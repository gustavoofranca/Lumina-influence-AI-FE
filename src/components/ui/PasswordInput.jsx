import { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Lock } from 'lucide-react'

import Input from './Input.jsx'
import { cn } from '../../lib/cn.js'
import { SENHA_MAX } from '../../lib/limites.js'

/**
 * Campo de senha com botão de mostrar. O botão substitui o "confirmar senha":
 * quem duvida do que digitou olha, em vez de digitar duas vezes (Baymard).
 */
const PasswordInput = forwardRef(function PasswordInput({ variant = 'padrao', ...rest }, ref) {
  const { t } = useTranslation()
  const [visivel, setVisivel] = useState(false)
  const Icone = visivel ? EyeOff : Eye

  return (
    <Input
      ref={ref}
      variant={variant}
      leftIcon={Lock}
      maxLength={SENHA_MAX}
      spellCheck={false}
      autoCapitalize="none"
      {...rest}
      type={visivel ? 'text' : 'password'}
      rightAdornment={(
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? t('auth.senha.hide') : t('auth.senha.show')}
          aria-pressed={visivel}
          className={cn(
            'rounded-md p-1 transition-colors',
            variant === 'vidro' ? 'text-landing-muted hover:text-landing-text' : 'text-text-muted hover:text-text-primary'
          )}
        >
          <Icone size={16} />
        </button>
      )}
    />
  )
})

export default PasswordInput
