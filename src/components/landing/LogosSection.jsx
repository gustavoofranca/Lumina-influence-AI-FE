import { useTranslation } from 'react-i18next'
import { siGoogle, siInstagram, siTiktok, siYoutube } from 'simple-icons'

import { cn } from '../../lib/cn.js'

/**
 * As quatro plataformas que o produto de fato integra.
 *
 * Os desenhos vêm do `simple-icons`, que publica a marca oficial de cada
 * plataforma — antes eram PNGs exportados do arquivo de design, e em tamanho
 * pequeno eles ficavam moles. Vetor resolve isso e ainda acompanha mudança de
 * marca por atualização de pacote.
 *
 * **Monocromático por decisão, não por limitação.** O pacote traz a cor oficial
 * em `hex` e ela é ignorada: quatro logos coloridos numa faixa disputam a
 * atenção com o herói logo acima. O `path` é pintado com `currentColor`, então
 * o realce do ponteiro é só um degrau de luminosidade.
 *
 * Sobre marca registrada: exibir o logo para dizer "integra com" é uso
 * nominativo, e é por isso que a página não afirma parceria, autorização nem
 * endosso em lugar nenhum — foi uma das frases que saíram daqui.
 */
const PLATAFORMAS = [
  { nome: 'Instagram', icone: siInstagram },
  { nome: 'Google',    icone: siGoogle },
  { nome: 'TikTok',    icone: siTiktok },
  { nome: 'YouTube',   icone: siYoutube },
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

        {/* `overflow-hidden` recorta o desfile na horizontal, mas recorta a
            vertical junto — e o ícone que sobe no hover saía pela borda de
            cima. Como o recorte acontece na borda do padding, a folga vertical
            resolve; a margem negativa devolve o espaçamento do layout. */}
        <div
          className="group relative -my-3 min-w-0 flex-1 overflow-hidden py-3"
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
              CONJUNTO.map(({ nome, icone }, i) => {
                const real = copia === 0 && i < PLATAFORMAS.length
                return (
                  <li
                    key={`${copia}-${nome}-${i}`}
                    aria-hidden={!real}
                    className={cn(
                      // Apagado em repouso, aceso no ponteiro: a faixa para de
                      // competir com o herói e ainda assim cada marca se
                      // identifica quando alguém repara nela.
                      'shrink-0 text-white/55 hover:text-white',
                      // Sobe e cresce um pouco ao receber o ponteiro.
                      'transition-[transform,color] duration-300 ease-out will-change-transform',
                      'hover:-translate-y-1.5 hover:scale-110',
                      'motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100'
                    )}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-8"
                      fill="currentColor"
                      role={real ? 'img' : 'presentation'}
                      aria-label={real ? nome : undefined}
                    >
                      {real && <title>{nome}</title>}
                      <path d={icone.path} />
                    </svg>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
