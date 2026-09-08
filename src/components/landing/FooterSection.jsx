import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import LuminaWordmark from '../ui/LuminaWordmark.jsx'
import { EMAIL_CONTATO } from '../../lib/contato.js'

// `apiDocs` saiu: o rótulo dizia "Documentação da API" e o destino era a
// âncora da seção de recursos. Não há documentação pública da API — o Swagger
// serve a equipe, não o visitante.
const PRODUTO = ['features', 'solutions']
const EMPRESA = ['privacy', 'terms', 'deletion', 'contact']

// Âncora começando com '#' rola na própria landing; o resto é rota da
// aplicação e precisa de <Link>, senão o navegador recarrega a página inteira.
// Privacidade, termos e exclusão apontavam para '#' — um link que não leva a
// lugar nenhum é reprovação certa no App Review da Meta, que abre cada um.
const DESTINOS = {
  features: '#features', solutions: '#plans',
  privacy: '/privacidade', terms: '/termos', deletion: '/exclusao-de-dados',
  contact: `mailto:${EMAIL_CONTATO}`,
}

// O texto de 12px deixa o alvo com 15px de altura; o padding vertical leva a
// 27px sem mexer no ritmo da coluna.
const ESTILO_LINK = cn(
  'inline-flex items-center py-1.5 text-sm leading-5 text-landing-muted',
  'transition-colors duration-300 hover:text-landing-text'
)

function LinkDoRodape({ destino, children }) {
  if (destino.startsWith('#') || destino.startsWith('mailto:')) {
    return <a href={destino} className={ESTILO_LINK}>{children}</a>
  }
  return <Link to={destino} className={ESTILO_LINK}>{children}</Link>
}

/**
 * Bloco que entra do desfoque quando aparece na tela.
 *
 * A referência faz isso com uma biblioteca de animação e um hook de movimento
 * reduzido. Aqui não precisa: a página já tem um observador de interseção que
 * marca `is-visible` no que entra na vista, e a transição inteira mora no CSS —
 * inclusive a guarda de `prefers-reduced-motion`. Uma dependência a menos para
 * carregar, e o atraso vira uma variável em vez de uma prop.
 *
 * `atraso` em milissegundos, escalonado pelos irmãos: é o que faz o rodapé
 * montar coluna a coluna em vez de piscar inteiro de uma vez.
 */
function Entrada({ atraso = 0, className, children }) {
  return (
    <div data-reveal="desfoque" style={{ '--delay': `${atraso}ms` }} className={className}>
      {children}
    </div>
  )
}

function Coluna({ titulo, chaves, t }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xs font-semibold uppercase tracking-label text-landing-text">
        {titulo}
      </h2>
      <ul className="flex flex-col gap-2">
        {chaves.map((chave) => (
          <li key={chave}>
            <LinkDoRodape destino={DESTINOS[chave]}>
              {t(`landing.footer.links.${chave}`)}
            </LinkDoRodape>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Rodapé.
 *
 * O desenho vem da referência que o Gustavo passou, adaptado ao que a página
 * já é. Três coisas foram de lá:
 *
 * - **A caixa se levanta do fundo.** Largura contida, topo arredondado e
 *   nenhuma tinta própria: o campo de estrelas continua passando por baixo, e
 *   o que separa o rodapé do resto é a luz na borda, não um retângulo opaco.
 * - **A luz nasce no meio da borda, não corre por ela.** A régua que ia de
 *   ponta a ponta virou um segmento curto e desfocado no centro, mais um lavado
 *   radial curto que desce do topo. Fecha a página sem desenhar uma linha.
 * - **O conteúdo entra escalonado**, saindo do desfoque, de cima para baixo.
 *
 * O que **não** veio: as quatro colunas de links inventados, os ícones de rede
 * social e a biblioteca de animação. Os itens são os nossos.
 */
export default function FooterSection() {
  const { t } = useTranslation()

  return (
    <footer
      className={cn(
        'relative mx-auto w-full max-w-[1180px] px-6 pb-16 pt-16 sm:px-8',
        // O arredondamento só lê porque a caixa tem largura contida. Em tela
        // estreita ela encosta nas bordas e o raio some junto — daí o `sm:`.
        'sm:rounded-t-[2rem] sm:border-t sm:border-white/[0.08]'
      )}
    >
      {/* Lavado curto descendo do topo. Sem tinta de fundo por baixo dele: o
          rodapé é uma clareira de luz sobre as estrelas, não um painel. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 sm:rounded-t-[2rem]"
        style={{
          background:
            'radial-gradient(35% 128px at 50% 0%, rgba(189,157,255,0.10) 0%, rgba(189,157,255,0) 100%)',
        }}
      />
      {/* O filete aceso, montado em cima da própria borda. `-translate-y-1/2`
          o deixa metade de cada lado dela, que é o que faz a borda parecer
          acender no meio em vez de ganhar um risco por cima. */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-1/2 top-0 hidden h-px w-1/3',
          '-translate-x-1/2 -translate-y-1/2 rounded-full bg-landing-violet/40 blur-[2px] sm:block'
        )}
      />

      <div className="relative flex flex-col gap-16">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          <Entrada className="flex flex-col gap-4">
            <LuminaWordmark />
            <p className="max-w-[320px] text-sm leading-[22.75px] text-landing-muted">
              {t('landing.footer.tagline')}
            </p>
            <p className="text-xs leading-4 text-landing-muted">
              {t('landing.footer.copyright')}
            </p>
          </Entrada>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <Entrada atraso={100}>
              <Coluna titulo={t('landing.footer.product')} chaves={PRODUTO} t={t} />
            </Entrada>
            <Entrada atraso={200}>
              <Coluna titulo={t('landing.footer.company')} chaves={EMPRESA} t={t} />
            </Entrada>
          </div>
        </div>

        <Entrada
          atraso={300}
          className="flex flex-col items-center gap-4 border-t border-landing-line/10 pt-8"
        >
          <p className="text-center text-sm leading-5 text-landing-muted">
            {t('landing.footer.ctaQuestion')}
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-base font-semibold leading-6 text-landing-violet transition-opacity hover:opacity-80"
          >
            {t('landing.footer.ctaLink')}
          </button>
        </Entrada>
      </div>
    </footer>
  )
}
