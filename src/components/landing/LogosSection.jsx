import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import instagram from '../../assets/landing/meta.png'
import google from '../../assets/landing/google.png'
import tiktok from '../../assets/landing/tiktok.png'
import youtube from '../../assets/landing/netflix.png'

// As camadas do arquivo de design estão nomeadas como "Meta" e "Netflix", mas a
// arte exportada é a do Instagram e a do YouTube — que são, junto com TikTok e
// Google, as plataformas que o produto de fato integra. O nome aqui segue a
// arte, não o rótulo da camada.
const PLATAFORMAS = [
  { nome: 'Instagram', src: instagram },
  { nome: 'Google',    src: google },
  { nome: 'TikTok',    src: tiktok },
  { nome: 'YouTube',   src: youtube },
]

// Quatro marcas não enchem a faixa: a trilha repete o conjunto até sobrar
// largura, e depois é duplicada inteira para o laço fechar sem emenda.
const CONJUNTO = [...PLATAFORMAS, ...PLATAFORMAS, ...PLATAFORMAS]

/**
 * Faixa das plataformas integradas, em desfile contínuo.
 *
 * Três decisões que sustentam o efeito:
 *
 * - **A trilha é o conjunto duplicado e anda -50%.** No instante em que o laço
 *   reinicia, o que está na tela é idêntico ao quadro anterior — por isso não
 *   se vê o salto. Animar a largura inteira faria a faixa piscar a cada volta.
 * - **Parar no hover é `animation-play-state`, não `animation: none`.** A
 *   segunda descartaria a posição e a faixa saltaria de volta ao início.
 * - **As pontas somem por máscara**, na mesma lógica das réguas da página: a
 *   faixa termina em difusão em vez de bater na borda da seção.
 *
 * O desfile não é conteúdo: a lista real está no primeiro conjunto, e as
 * repetições saem da árvore de acessibilidade.
 */
export default function LogosSection() {
  const { t } = useTranslation()

  return (
    <section className={cn(
      'relative py-12',
      // Réguas que somem nas duas pontas, em vez de borda cheia batendo na
      // beirada da janela.
      "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-hairline-fade before:content-['']",
      "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-hairline-fade after:content-['']"
    )}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-7 px-6 sm:px-8">
        {/* Acima da faixa e centralizado: o rótulo introduz o que vem embaixo
            em vez de disputar a linha com ele. */}
        <p className="text-center text-sm text-landing-muted">
          {t('landing.logos.label')}
        </p>

        <div
          className="group relative min-w-0 flex-1 overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
          }}
        >
          <ul
            className={cn(
              'flex w-max items-center gap-16 animate-desfilar',
              'group-hover:[animation-play-state:paused]',
              'motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:w-full'
            )}
          >
            {[0, 1].map((copia) =>
              CONJUNTO.map(({ nome, src }, i) => (
                <li
                  key={`${copia}-${nome}-${i}`}
                  aria-hidden={copia === 1 || i >= PLATAFORMAS.length}
                  className={cn(
                    // Monocromático em repouso, cor de volta no ponteiro: a
                    // faixa para de competir com o herói e ainda assim cada
                    // marca se identifica quando alguém repara nela.
                    'size-8 shrink-0 grayscale opacity-55 hover:grayscale-0',
                    // Sobe e cresce um pouco ao receber o ponteiro. `will-change`
                    // evita o tremor de reamostragem que aparece em transform
                    // sobre imagem pequena.
                    'transition-[transform,opacity,filter] duration-300 ease-out will-change-transform',
                    'hover:-translate-y-1.5 hover:scale-110 hover:opacity-100',
                    'motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100'
                  )}
                >
                  <img
                    src={src}
                    alt={copia === 0 && i < PLATAFORMAS.length ? nome : ''}
                    className="size-full object-contain"
                  />
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
