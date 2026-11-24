import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail } from 'lucide-react'

import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import AvisoDeEntrada from './AvisoDeEntrada.jsx'
import { idDoCampo, useCampos } from '../../hooks/useCampos.js'
import { mensagemDeAuth } from '../../lib/errosDeAuth.js'
import { LIMITES, validarEmail } from '../../lib/limites.js'

/**
 * Um campo de e-mail e um botão que pede um link — para redefinir a senha ou
 * para confirmar o e-mail de novo. A resposta da API é a mesma exista ou não a
 * conta, e a mensagem de sucesso também.
 */
export default function PedirLink({ enviar, rotulo, enviado, emailInicial = '' }) {
  const { t } = useTranslation()
  const { campos, erros, set, sair, validarTudo } = useCampos(
    { email: emailInicial },
    { email: (tt, c) => validarEmail(tt, c.email) }
  )
  const [estado, setEstado] = useState({ enviando: false, aviso: null })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validarTudo()) return
    setEstado({ enviando: true, aviso: null })
    try {
      await enviar(campos.email.trim())
      setEstado({ enviando: false, aviso: { tipo: 'ok', texto: enviado } })
    } catch (err) {
      setEstado({ enviando: false, aviso: { tipo: 'erro', texto: mensagemDeAuth(t, err) } })
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Input
        variant="vidro"
        id={idDoCampo('email')}
        label={t('auth.login.email')}
        type="email"
        inputMode="email"
        leftIcon={Mail}
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={LIMITES.email}
        value={campos.email}
        onChange={(e) => set('email', e.target.value)}
        onBlur={() => sair('email')}
        error={erros.email}
      />
      {estado.aviso && <AvisoDeEntrada tipo={estado.aviso.tipo}>{estado.aviso.texto}</AvisoDeEntrada>}
      <Button type="submit" variant="vidro-primaria" fullWidth size="lg" loading={estado.enviando}>
        {rotulo}
      </Button>
    </form>
  )
}
