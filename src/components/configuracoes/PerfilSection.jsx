import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Mail } from 'lucide-react'

import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import ApiErrorBanner from '../ui/ApiErrorBanner.jsx'
import ExcluirContaCard from './ExcluirContaCard.jsx'
import SegurancaCard from './SegurancaCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { LIMITES, errosDaApi, validarNomePessoa } from '../../lib/limites.js'
import { updateOwnProfile } from '../../services/team.js'

const ROLE_VARIANT = {
  admin:  'organic',
  member: 'paid',
  viewer: 'neutral',
}

/**
 * Dados pessoais.
 *
 * `users` guarda nome, e-mail, avatar e papel. O e-mail vem do provedor OAuth
 * e não é editável aqui; o papel só muda pela tela de Equipe, por um admin.
 * Cargo e telefone não têm coluna — eram texto fixo no código, exibido como se
 * fosse do usuário.
 */
export default function PerfilSection({ onSave }) {
  const { t } = useTranslation()
  const { user, refreshUser } = useAuth()

  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [erroNome, setErroNome] = useState(null)

  useEffect(() => {
    if (user) setName(user.name)
  }, [user])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    // A mesma regra da API (lib/limites.js).
    const invalido = validarNomePessoa(t, name)
    setErroNome(invalido)
    if (invalido) return
    setSaving(true)
    setError(null)
    try {
      await updateOwnProfile(user.id, { name })
      await refreshUser()
      onSave?.()
    } catch (err) {
      const porCampo = errosDaApi(err, { name: 'name' })
      if (porCampo.name) setErroNome(porCampo.name)
      else setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <div>
            <CardLabel>{t('configuracoes.perfil.title')}</CardLabel>
            <CardTitle className="mt-1.5">{t('configuracoes.perfil.title')}</CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {t('configuracoes.perfil.subtitle')}
            </p>
          </div>

          <ApiErrorBanner error={error} />

          <div className="flex items-center gap-4">
            <Avatar name={name || user?.name || '?'} size="xl" />
            <div>
              <p className="font-display text-lg font-bold text-text-primary">
                {user?.name}
              </p>
              {user?.role && (
                <Badge variant={ROLE_VARIANT[user.role]} uppercase={false} className="mt-1">
                  {t(`configuracoes.equipe.roles.${user.role}`, user.role)}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              label={t('configuracoes.perfil.name')}
              leftIcon={User}
              value={name}
              onChange={(e) => { setName(e.target.value); setErroNome(null) }}
              required
              maxLength={LIMITES.nomePessoa}
              error={erroNome}
            />
            <Input
              label={t('configuracoes.perfil.email')}
              leftIcon={Mail}
              type="email"
              value={user?.email || ''}
              readOnly
              disabled
              helperText={t('configuracoes.perfil.emailFixed')}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={saving || !user}>
            {saving ? t('configuracoes.saving') : t('configuracoes.save')}
          </Button>
        </div>
      </form>

      <SegurancaCard />

      {/* Zona de perigo por último e visualmente separada: é o direito de
          eliminação do titular, não uma preferência de perfil. */}
      <ExcluirContaCard />
    </div>
  )
}
