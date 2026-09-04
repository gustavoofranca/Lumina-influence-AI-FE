import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import CartaoDeVidro from './CartaoDeVidro.jsx'
import { PILULA, TEXTO_PILULA, TITULO_SECAO, WASH_SECAO } from './estilos.js'

import painelPt from '../../assets/landing/produto/painel-pt.webp'
import painelEn from '../../assets/landing/produto/painel-en.webp'
import criadorPt from '../../assets/landing/produto/criador-pt.webp'
import criadorEn from '../../assets/landing/produto/criador-en.webp'

/**
 * O produto rodando — o bloco que faltava no argumento da página.
 *
 * Toda a landing afirmava coisas sobre o sistema sem nunca mostrá-lo. As
 * capturas aqui saíram da aplicação em execução contra o banco de demonstração,
 * e a primeira delas prova a tese em vez de repeti-la: "ROI TOTAL" e "CAC
 * MÉDIO" aparecem literalmente com um traço, porque o sistema não mede caixa.
 * Uma frase dizendo isso é marketing; a tela dizendo isso é evidência.
 *
 * **As capturas acompanham o idioma.** Uma tela em português mostrada a quem
 * está lendo em inglês desmente a própria página, que acabou de dizer que todo
 * número traz sua origem.
 *
 * ## Por que `sticky` e não uma biblioteca de scroll
 *
 * A imagem fica presa enquanto o texto de cada passo passa ao lado. Isso é
 * `position: sticky` mais um `IntersectionObserver` para saber qual passo está
 * na altura da leitura — 0 KB, e é o que o projeto já usa em `useScrollReveal`.
 * Uma linha do tempo com GSAP daria mais controle e custaria ~40 KB numa página
 * que já roda WebGL e canvas; quando existir uma orquestração que a `sticky`
 * não dê conta, aí a dependência se paga.
 *
 * Abaixo de `lg` não há coluna dupla: cada passo vira um bloco com a sua
 * imagem, empilhado. Prender imagem em tela estreita esconde o texto.
 */
export default function ProvaSection() {
  const { t, i18n } = useTranslation()
  const passos = t('landing.prova.passos', { returnObjects: true })
  const pt = i18n.language?.startsWith('pt')
  const imagens = [pt ? painelPt : painelEn, pt ? criadorPt : criadorEn]

  const [ativo, setAtivo] = useState(0)
  const refs = useRef([])

  useEffect(() => {
    const alvos = refs.current.filter(Boolean)
    if (!alvos.length) return

    // O observador é só o gatilho; quem decide é a posição de todos os alvos.
    // Confiar nas entradas recebidas prende o passo no último que cruzou a
    // borda — foi o defeito que o menu do topo já teve.
    const atualizar = () => {
      const linha = window.innerHeight * 0.45
      let escolhido = 0
      alvos.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= linha) escolhido = i
      })
      setAtivo(escolhido)
    }

    const observador = new IntersectionObserver(atualizar, { threshold: [0, 0.3, 0.6, 1] })
    alvos.forEach((el) => observador.observe(el))
    window.addEventListener('scroll', atualizar, { passive: true })
    atualizar()
    return () => {
      observador.disconnect()
      window.removeEventListener('scroll', atualizar)
    }
  }, [passos.length])

  return (
    <section
      id="prova"
      className={cn(WASH_SECAO, 'mx-auto w-full max-w-[1180px] px-6 py-24 sm:px-8')}
    >
      <div className="flex max-w-[52ch] flex-col gap-4">
        <span className={cn(PILULA, TEXTO_PILULA, 'w-fit px-3.5 py-1 text-sm font-medium')}>
          {t('landing.prova.selo')}
        </span>
        <h2 className={TITULO_SECAO}>{t('landing.prova.title')}</h2>
        <p className="text-lg leading-relaxed text-landing-muted">
          {t('landing.prova.subtitle')}
        </p>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        {/* Coluna do texto: um bloco por passo, com altura suficiente para o
            leitor percorrer enquanto a imagem fica parada ao lado. */}
        <div className="flex flex-col">
          {passos.map((passo, i) => (
            <div
              key={passo.title}
              ref={(el) => { refs.current[i] = el }}
              className="flex flex-col justify-center gap-3 py-10 lg:min-h-[62vh]"
            >
              <span
                className={cn(
                  'w-fit text-xs font-semibold uppercase tracking-[0.14em] transition-colors',
                  i === ativo ? 'text-landing-measured' : 'text-landing-unmeasured'
                )}
              >
                {passo.rotulo}
              </span>
              <h3 className="font-display text-2xl font-semibold leading-tight text-landing-text">
                {passo.title}
              </h3>
              <p className="max-w-[46ch] text-[15px] leading-relaxed text-landing-muted">
                {passo.desc}
              </p>

              {/* Em tela estreita a imagem acompanha o próprio passo. */}
              <CartaoDeVidro className="mt-5 lg:hidden" interno="!p-2">
                <img
                  src={imagens[i]}
                  alt={passo.title}
                  loading="lazy"
                  className="w-full rounded-xl"
                />
              </CartaoDeVidro>
            </div>
          ))}
        </div>

        {/* Coluna da imagem: presa enquanto os passos passam. */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <CartaoDeVidro interno="!p-2">
              <div className="relative overflow-hidden rounded-xl">
                {imagens.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={passos[i].title}
                    loading="lazy"
                    className={cn(
                      'w-full transition-opacity duration-500 motion-reduce:transition-none',
                      i === ativo ? 'opacity-100' : 'absolute inset-0 opacity-0'
                    )}
                    aria-hidden={i !== ativo}
                  />
                ))}
              </div>
            </CartaoDeVidro>
          </div>
        </div>
      </div>
    </section>
  )
}
