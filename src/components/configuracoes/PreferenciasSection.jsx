import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Clock, Moon } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Switch from '../ui/Switch.jsx'
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx'
import { TIMEZONES } from '../../lib/constants.js'

function PrefRow({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-3 border-t border-neutral-800 pt-5 first:border-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600/15 text-primary-300 ring-1 ring-inset ring-primary-500/20">
          <Icon size={15} />
        </span>
        <div>
          <p className="font-semibold text-neutral-100">{title}</p>
          <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>
        </div>
      </div>
      <div className="shrink-0 sm:ml-auto">
        {children}
      </div>
    </div>
  )
}

function NotificationToggleRow({ value, onChange, label, desc }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-neutral-900/40 p-4 ring-1 ring-inset ring-neutral-800">
      <div>
        <p className="text-sm font-semibold text-neutral-100">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{desc}</p>
      </div>
      <Switch checked={value} onChange={onChange} />
    </div>
  )
}

export default function PreferenciasSection() {
  const { t } = useTranslation()
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [notif, setNotif] = useState({
    email:  true,
    inApp:  true,
    weekly: false,
    alerts: true,
  })

  const setKey = (key) => (val) => setNotif((p) => ({ ...p, [key]: val }))

  return (
    <div className="flex flex-col gap-6">
      {/* Geral: idioma + tema + fuso */}
      <Card glass className="flex flex-col gap-5">
        <div>
          <CardLabel>{t('configuracoes.preferencias.title')}</CardLabel>
          <CardTitle className="mt-1.5">{t('configuracoes.preferencias.title')}</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">
            {t('configuracoes.preferencias.subtitle')}
          </p>
        </div>

        <div className="space-y-5">
          <PrefRow
            icon={Globe}
            title={t('configuracoes.preferencias.language.title')}
            subtitle={t('configuracoes.preferencias.language.subtitle')}
          >
            <LanguageSwitcher />
          </PrefRow>

          <PrefRow
            icon={Clock}
            title={t('configuracoes.preferencias.timezone.title')}
            subtitle={t('configuracoes.preferencias.timezone.subtitle')}
          >
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className={cn(
                'h-10 min-w-[220px] cursor-pointer rounded-xl bg-bg-input px-3 text-sm text-neutral-100',
                'ring-1 ring-inset ring-neutral-700 transition-all duration-150',
                'hover:ring-neutral-600',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:shadow-glow-soft'
              )}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value} className="bg-neutral-800">
                  {tz.label}
                </option>
              ))}
            </select>
          </PrefRow>

          <PrefRow
            icon={Moon}
            title={t('configuracoes.preferencias.theme.title')}
            subtitle={t('configuracoes.preferencias.theme.subtitle')}
          >
            <span className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-200 ring-1 ring-inset ring-neutral-700">
              <Moon size={13} />
              {t('configuracoes.preferencias.theme.dark')}
            </span>
          </PrefRow>
        </div>
      </Card>

      {/* Notificações */}
      <Card glass className="flex flex-col gap-5">
        <div>
          <CardLabel>{t('configuracoes.preferencias.notifications.title')}</CardLabel>
          <CardTitle className="mt-1.5">{t('configuracoes.preferencias.notifications.title')}</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">
            {t('configuracoes.preferencias.notifications.subtitle')}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <NotificationToggleRow
            value={notif.email}
            onChange={setKey('email')}
            label={t('configuracoes.preferencias.notifications.email.label')}
            desc={t('configuracoes.preferencias.notifications.email.desc')}
          />
          <NotificationToggleRow
            value={notif.inApp}
            onChange={setKey('inApp')}
            label={t('configuracoes.preferencias.notifications.inApp.label')}
            desc={t('configuracoes.preferencias.notifications.inApp.desc')}
          />
          <NotificationToggleRow
            value={notif.weekly}
            onChange={setKey('weekly')}
            label={t('configuracoes.preferencias.notifications.weekly.label')}
            desc={t('configuracoes.preferencias.notifications.weekly.desc')}
          />
          <NotificationToggleRow
            value={notif.alerts}
            onChange={setKey('alerts')}
            label={t('configuracoes.preferencias.notifications.alerts.label')}
            desc={t('configuracoes.preferencias.notifications.alerts.desc')}
          />
        </div>
      </Card>
    </div>
  )
}
