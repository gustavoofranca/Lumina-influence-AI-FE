import { useTranslation } from 'react-i18next'

import instagram from '../../assets/landing/meta.png'
import google from '../../assets/landing/google.png'
import tiktok from '../../assets/landing/tiktok.png'
import youtube from '../../assets/landing/netflix.png'

// As camadas do arquivo de design estão nomeadas como "Meta" e "Netflix", mas a
// arte exportada é a do Instagram e a do YouTube — que são, junto com TikTok e
// Google, as plataformas que o produto de fato integra. O nome aqui segue a
// arte, não o rótulo da camada.
const PARCEIROS = [
  { nome: 'Instagram', src: instagram },
  { nome: 'Google',    src: google },
  { nome: 'TikTok',    src: tiktok },
  { nome: 'YouTube',   src: youtube },
]

export default function LogosSection() {
  const { t } = useTranslation()

  return (
    <section className="border-y border-landing-line/15 bg-landing-surface/50 py-12">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-8">
        <p className="text-center text-xs font-semibold uppercase leading-4 tracking-[2.4px] text-landing-muted opacity-50">
          {t('landing.logos.label')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-24 gap-y-8 opacity-40">
          {PARCEIROS.map(({ nome, src }) => (
            <div key={nome} className="size-6 shrink-0">
              <img src={src} alt={nome} className="size-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
