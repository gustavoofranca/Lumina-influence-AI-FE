import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { siGoogle, siInstagram, siTiktok, siYoutube } from 'simple-icons'

import { cn } from '../../lib/cn.js'
import { useCartaoIluminado } from '../../hooks/useLuzDoPonteiro.js'

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
 * o realce é só um degrau de luminosidade.
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

// A luz de revelação: onde ela passa, a camada acesa aparece. É o mesmo
// centro que os cartões de vidro usam, com o mesmo padrão de "longe" quando o
// ponteiro está fora de alcance — aí a camada inteira fica transparente.
const LUZ_X = 'var(--luz-cx, -9999px)'
const LUZ_Y = 'var(--luz-cy, -9999px)'
const MASCARA_DA_LUZ =
  `radial-gradient(190px circle at ${LUZ_X} ${LUZ_Y}, #000 0%, rgba(0,0,0,0.55) 45%, transparent 100%)`


/**
 * Uma fileira de marcas. Desenhada duas vezes, idênticas: uma apagada, no
 * fluxo, e uma acesa por cima, recortada pela luz.
 */
function Fileira({ acesa = false }) {
  return (
    <ul
      aria-hidden={acesa || undefined}
      className={cn(
        'grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4',
        acesa && 'pointer-events-none absolute inset-0'
      )}
      style={acesa ? { maskImage: MASCARA_DA_LUZ, WebkitMaskImage: MASCARA_DA_LUZ } : undefined}
    >
      {PLATAFORMAS.map(({ nome, icone }) => (
        <li key={nome} className="flex flex-col items-center gap-3">
          {/* O nome escrito ao lado já identifica a marca, então o desenho sai
              da árvore de acessibilidade: com os dois, o leitor de tela diria
              "Instagram, imagem, Instagram". */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className={cn(
              'size-8',
              acesa
                ? 'text-white [filter:drop-shadow(0_0_14px_rgba(189,157,255,0.6))]'
                : 'text-white/40'
            )}
            fill="currentColor"
          >
            <path d={icone.path} />
          </svg>
          <span
            className={cn(
              'text-xs font-medium tracking-label uppercase',
              acesa ? 'text-white' : 'text-landing-muted'
            )}
          >
            {nome}
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Faixa das plataformas integradas — parada, e acesa pela luz do ponteiro.
 *
 * Era um desfile contínuo. Saiu por duas razões: movimento perpétuo logo abaixo
 * do herói compete com ele pela atenção, e quatro marcas precisavam ser
 * repetidas três vezes para encher a trilha, o que as fazia parecer mais do que
 * são.
 *
 * O que substitui o movimento é a mesma luz que acende os cartões de vidro. A
 * fileira existe duas vezes, empilhada: a de baixo é a faixa em repouso, a de
 * cima é a mesma fileira acesa, e só aparece dentro do círculo de luz. Nada se
 * move — o que se move é a luz, e ela revela as marcas por onde passa.
 *
 * Sem ponteiro (toque) ou com movimento reduzido, a luz não é registrada e a
 * camada acesa fica inteira fora do círculo: sobra a faixa em repouso, que é
 * completa sozinha. É o mesmo contrato do resto da página.
 */
export default function LogosSection() {
  const { t } = useTranslation()
  const faixa = useRef(null)
  useCartaoIluminado(faixa)

  return (
    <section className={cn(
      'relative py-12',
      // Réguas que somem nas duas pontas, em vez de borda cheia batendo na
      // beirada da janela.
      "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-hairline-fade before:content-['']",
      "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-hairline-fade after:content-['']"
    )}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-6 sm:px-8">
        {/* Acima da faixa e centralizado: o rótulo introduz o que vem embaixo
            em vez de disputar a linha com ele. */}
        <p className="text-center text-sm text-landing-muted">
          {t('landing.logos.label')}
        </p>

        {/* Sem halo de fundo, de propósito. Um gradiente atrás das marcas
            precisa de uma caixa, e a luz pode estar em qualquer ponto dentro
            do alcance: sempre haveria um lado em que o círculo encosta na
            borda e vira um retângulo de quina dura — foi o que apareceu na
            primeira versão. O brilho vem do próprio desenho aceso. */}
        <div ref={faixa} className="relative mx-auto w-full max-w-3xl">
          <Fileira />
          <Fileira acesa />
        </div>
      </div>
    </section>
  )
}
