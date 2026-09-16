import { useTranslation } from 'react-i18next'
import { CalendarClock } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'

// Abaixo disso a mediana de um dia é o número de um ou dois posts, e "quinta é
// o melhor dia" viraria "aquele Reel de quinta foi bem".
const MINIMO_DE_POSTS = 3

const FUSO = 'America/Sao_Paulo'
const PERIODOS = [
  { key: 'dawn', de: 0, ate: 6 },
  { key: 'morning', de: 6, ate: 12 },
  { key: 'afternoon', de: 12, ate: 18 },
  { key: 'night', de: 18, ate: 24 },
]

function mediana(valores) {
  const v = [...valores].sort((a, b) => a - b)
  const meio = Math.floor(v.length / 2)
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2
}

/** Dia da semana (0 = domingo) e hora no fuso da criadora, não no do navegador. */
function momento(iso) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO, weekday: 'short', hour: 'numeric', hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const dias = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return {
    dia: dias.indexOf(partes.find((p) => p.type === 'weekday').value),
    hora: Number(partes.find((p) => p.type === 'hour').value),
  }
}

function agrupar(posts, chave, rotulos) {
  const grupos = rotulos.map((r) => ({ ...r, alcances: [] }))
  posts.forEach((p) => grupos[chave(p)]?.alcances.push(p.alcance))
  return grupos.map((g) => ({
    ...g,
    n: g.alcances.length,
    mediana: g.alcances.length ? mediana(g.alcances) : null,
  }))
}

function melhor(grupos) {
  return grupos
    .filter((g) => g.n >= MINIMO_DE_POSTS)
    .sort((a, b) => b.mediana - a.mediana)[0] || null
}

/**
 * Quando publicar, segundo o próprio histórico da criadora.
 *
 * Sai só dos posts coletados com alcance medido — sem IA e sem cota. Usa
 * mediana, não média: um Reel viral de 290 mil puxaria a média do dia em que
 * saiu e elegeria esse dia por um post só. E diz a base de cada número, porque
 * é correlação no histórico, não promessa de alcance.
 */
export default function MelhorHorarioCard({ posts = [] }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US'
  const fmt = (n) => Math.round(n).toLocaleString(locale)

  const validos = posts
    .filter((p) => p.alcance != null && p.alcance > 0 && p.data)
    .map((p) => ({ ...p, ...momento(p.data) }))

  // 04/01/2026 foi domingo: dali em diante, um dia por índice.
  const nomeDoDia = (i, weekday) => new Intl.DateTimeFormat(locale, { weekday, timeZone: 'UTC' })
    .format(new Date(Date.UTC(2026, 0, 4 + i)))
  const dias = agrupar(validos, (p) => p.dia, Array.from({ length: 7 }, (_, i) => ({
    key: i, nome: nomeDoDia(i, 'long'), curto: nomeDoDia(i, 'short').replace('.', ''),
  })))
  const periodos = agrupar(
    validos,
    (p) => PERIODOS.findIndex((x) => p.hora >= x.de && p.hora < x.ate),
    PERIODOS.map((x) => ({ ...x, nome: t(`influenciador.bestTime.periods.${x.key}`) }))
  )

  const geral = validos.length ? mediana(validos.map((p) => p.alcance)) : null
  const melhorDia = melhor(dias)
  const melhorPeriodo = melhor(periodos)
  const acima = (g) => (geral ? Math.round((g.mediana / geral - 1) * 100) : 0)
  const maiorMediana = Math.max(1, ...dias.map((d) => d.mediana || 0))

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('influenciador.bestTime.label')}</CardLabel>
        <CardTitle className="mt-1.5">{t('influenciador.bestTime.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('influenciador.bestTime.subtitle')}</p>
      </div>

      {!melhorDia || !melhorPeriodo ? (
        <EmptyState icon={CalendarClock} title={t('influenciador.bestTime.notEnough', { min: MINIMO_DE_POSTS })} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { rotulo: t('influenciador.bestTime.bestDay'), g: melhorDia },
              { rotulo: t('influenciador.bestTime.bestPeriod'), g: melhorPeriodo },
            ].map(({ rotulo, g }) => (
              <div key={rotulo} className="rounded-xl border border-primary/15 bg-bg-base/40 p-4">
                <span className="text-label">{rotulo}</span>
                <div className="mt-2 font-display text-2xl font-extrabold capitalize text-text-primary">
                  {g.nome}
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  {t(acima(g) >= 0 ? 'influenciador.bestTime.above' : 'influenciador.bestTime.below', {
                    pct: Math.abs(acima(g)),
                  })}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {t('influenciador.bestTime.base', { median: fmt(g.mediana), n: g.n })}
                </p>
              </div>
            ))}
          </div>

          {/* Mediana por dia. Dia com menos posts que o mínimo aparece apagado:
              está no gráfico, mas não concorre ao título de melhor dia. */}
          <div className="flex h-32 items-end gap-2" role="img" aria-label={t('influenciador.bestTime.chartAria')}>
            {dias.map((d) => {
              const fraco = d.n < MINIMO_DE_POSTS
              const destaque = d.key === melhorDia.key
              return (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] tabular-nums text-text-muted">{d.n ? fmt(d.mediana) : '—'}</span>
                  <div
                    className={cn(
                      'w-full rounded-t-md transition-all',
                      destaque ? 'bg-primary-500 shadow-glow-soft' : 'bg-primary-500/35',
                      fraco && 'bg-text-muted/20'
                    )}
                    style={{ height: `${d.n ? Math.max(6, (d.mediana / maiorMediana) * 80) : 4}px` }}
                    title={t('influenciador.bestTime.base', { median: d.n ? fmt(d.mediana) : '—', n: d.n })}
                  />
                  <span className={cn('text-[11px] capitalize', destaque ? 'font-semibold text-accent' : 'text-text-muted')}>
                    {d.curto}
                  </span>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-text-muted">
            {t('influenciador.bestTime.footnote', { n: validos.length, median: fmt(geral), min: MINIMO_DE_POSTS })}
          </p>
        </>
      )}
    </Card>
  )
}
