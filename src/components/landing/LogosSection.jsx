import { useTranslation } from 'react-i18next'

import { InstagramIcon, TikTokIcon, YouTubeIcon } from '../icons/PlatformIcons.jsx'

const PLATFORMS = [
  { name: 'Instagram', Icon: InstagramIcon },
  { name: 'TikTok',    Icon: TikTokIcon },
  { name: 'YouTube',   Icon: YouTubeIcon },
]

export default function LogosSection() {
  const { t } = useTranslation()
  return (
    <section className="border-y border-primary/10 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="mb-8 text-center text-label">{t('landing.logos.label')}</p>
        <div className="flex items-center justify-center gap-16">
          {PLATFORMS.map(({ name, Icon }, i) => (
            <div
              key={name}
              data-reveal
              style={{ '--delay': `${i * 100}ms` }}
              className="flex flex-col items-center gap-2 text-text-muted transition-colors hover:text-text-secondary"
            >
              <Icon size={32} />
              <span className="text-xs font-semibold tracking-label">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
