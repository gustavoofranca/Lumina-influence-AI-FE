import { useTranslation } from 'react-i18next'
import { Global } from 'iconsax-reactjs'

import { cn } from '../../lib/cn.js'
// A variante `vidro` existe só na landing, e o vidro dela tem de ser o MESMO
// dos botões do herói — foi o que o Gustavo pediu ao comparar os dois. Importar
// a receita é o que impede que elas divirjam com o tempo.
import { PILULA } from '../landing/estilos.js'

const LANGS = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
]

/**
 * Pilha de sombras que faz o cursor deslizante parecer uma lâmina de vidro
 * apoiada sobre a trilha.
 *
 * As quatro primeiras prendem a luz nas arestas — espalhamento negativo maior
 * que o desfoque, a mesma técnica das pílulas em `landing/estilos.js`. As duas
 * seguintes são diferentes de propósito: `inset 0 0 6px 6px` e
 * `inset 0 0 2px 2px` iluminam o **miolo**, e nas pílulas elas foram
 * descartadas justamente por isso. Aqui o cursor precisa ler como peça cheia
 * apoiada em cima, não como contorno vazado — se o miolo não acender, ele some
 * contra a trilha e o controle perde o estado selecionado.
 */
const LAMINA = [
  'inset 3px 3px 0.5px -3.5px rgba(216,199,255,0.30)',
  'inset -3px -3px 0.5px -3.5px rgba(216,199,255,0.90)',
  'inset 1px 1px 1px -0.5px rgba(189,157,255,0.55)',
  'inset -1px -1px 1px -0.5px rgba(189,157,255,0.55)',
  'inset 0 0 6px 6px rgba(255,255,255,0.10)',
  'inset 0 0 2px 2px rgba(255,255,255,0.05)',
  '0 0 12px rgba(124,58,237,0.30)',
].join(',')

/**
 * LanguageSwitcher — toggle pt/en integrado ao react-i18next.
 *
 * variant:
 *   'pill' (padrao) — par de botoes "PT | EN" tipo segmented control
 *   'vidro'         — mesmo controle na linguagem de vidro da landing
 *   'icon'          — icon button compacto que alterna o idioma
 */
export default function LanguageSwitcher({ variant = 'pill', className = '' }) {
  const { i18n, t } = useTranslation()
  const current = i18n.language?.startsWith('pt') ? 'pt' : 'en'

  const setLang = (code) => {
    i18n.changeLanguage(code)
    document.documentElement.lang = code === 'pt' ? 'pt-BR' : 'en'
  }

  if (variant === 'vidro') {
    return (
      <div
        role="group"
        aria-label={t('common.language')}
        data-idioma={current}
        style={{ '--lamina': LAMINA }}
        className={cn(
          'relative isolate inline-grid h-9 grid-cols-2 items-center rounded-full p-0.5',
          // O mesmo vidro dos botões do herói, e pelo mesmo motivo: nada de
          // tinta própria, o fundo atravessa borrado e o que desenha a peça são
          // as arestas acesas. A versão anterior pintava um degradê e o amassava
          // com `feTurbulence` + `feDisplacementMap` — o que dava manchas
          // escuras, porque o deslocamento puxa pixels de FORA da região do
          // filtro, e fora dela só existe preto transparente. Sem o filtro, o
          // defeito não tem como voltar.
          PILULA,
          // O cursor é um pseudo-elemento só, que desliza. Dois nós trocando de
          // classe piscariam na troca em vez de percorrer o caminho.
          "after:pointer-events-none after:absolute after:inset-y-0.5 after:left-0.5 after:content-['']",
          // `shadow-[shadow:…]` e não `shadow-[…]`: com um `var()` dentro, o
          // Tailwind não sabe se o valor é sombra ou cor de sombra, resolve
          // como cor e o utilitário sai vazio. A dica de tipo desfaz o empate.
          'after:w-[calc(50%-0.125rem)] after:rounded-full after:shadow-[shadow:var(--lamina)]',
          // A lâmina borra um pouco mais que a trilha: é o que faz ela ler como
          // peça sobreposta, e não como uma mancha clara dentro do mesmo vidro.
          'after:backdrop-blur-[2px]',
          'after:transition-transform after:duration-300',
          'after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
          'motion-reduce:after:transition-none',
          'data-[idioma=pt]:after:translate-x-0 data-[idioma=en]:after:translate-x-full',
          className
        )}
      >
        {LANGS.map((lang) => {
          const active = lang.code === current
          const outro = LANGS.find((l) => l.code !== lang.code).code
          return (
            <button
              key={lang.code}
              type="button"
              // Clicar no idioma que já está ativo troca para o outro. Com duas
              // opções isso equivale a "qualquer clique alterna", que é o
              // comportamento esperado de um interruptor — e é o que a variante
              // de ícone já fazia. O rótulo acessível continua sendo "PT"/"EN",
              // igual ao visível: um `aria-label` descrevendo a ação diria algo
              // que não está escrito no botão.
              onClick={() => setLang(active ? outro : lang.code)}
              aria-pressed={active}
              title={`${t('common.language')}: ${current.toUpperCase()} → ${(active ? outro : lang.code).toUpperCase()}`}
              className={cn(
                // `z-10` põe o rótulo acima do cursor: sem isto o pseudo-elemento
                // pinta depois dos filhos e cobre o texto que ele deveria realçar.
                'relative z-10 inline-flex h-full min-w-9 select-none items-center justify-center',
                'rounded-full px-3 text-xs font-semibold tracking-wide transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                'focus-visible:outline-landing-measured',
                active ? 'text-white' : 'text-landing-muted hover:text-landing-text'
              )}
            >
              {lang.label}
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === 'icon') {
    const next = current === 'pt' ? 'en' : 'pt'
    return (
      <button
        type="button"
        onClick={() => setLang(next)}
        aria-label={t('common.language')}
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-2xl text-text-secondary',
          'ring-1 ring-inset ring-transparent transition-all duration-200',
          'hover:bg-bg-surface hover:text-text-primary hover:ring-hairline',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
          className
        )}
        title={`${t('common.language')}: ${current.toUpperCase()} → ${next.toUpperCase()}`}
      >
        <Global size={18} />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-2xl bg-bg-surface p-0.5',
        'ring-1 ring-inset ring-hairline',
        className
      )}
      role="group"
      aria-label={t('common.language')}
    >
      {LANGS.map((lang) => {
        const active = lang.code === current
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLang(lang.code)}
            aria-pressed={active}
            className={cn(
              'inline-flex h-8 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold tracking-wide transition-all duration-200',
              active
                ? 'bg-primary-600 text-white shadow-glow-soft'
                : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
            )}
          >
            {lang.label}
          </button>
        )
      })}
    </div>
  )
}
