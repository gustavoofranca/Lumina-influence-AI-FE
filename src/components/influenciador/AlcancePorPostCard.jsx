import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'

const COR_POST = '#7C3AED'
const COR_CAMPANHA = '#0EA5E9'

const abreviar = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return String(n)
}

function Dica({ active, payload, locale, t }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="max-w-[16rem] rounded-xl border border-hairline bg-bg-elevated px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-text-primary">{p.dataLonga}</div>
      <div className="mt-0.5 line-clamp-2 text-text-secondary">{p.legenda}</div>
      <div className="mt-1.5 tabular-nums text-text-primary">
        {t('influenciador.reachByPost.reach')}: <b>{p.alcance.toLocaleString(locale)}</b>
      </div>
      {p.campanha && <div className="mt-0.5 font-semibold text-tint-sky">{p.campanha}</div>}
    </div>
  )
}

/**
 * Alcance de cada post coletado, na ordem em que saiu.
 *
 * Substitui o gráfico orgânico × pago para quem só tem coleta real: a API não
 * separa as duas coisas (ADR-005), e aquele gráfico pintava tudo de orgânico.
 * Aqui só vai o que foi medido — o alcance total — e os posts de campanha
 * ganham cor própria, que é o que se quer ver: a campanha se destacou ou não.
 * Post sem alcance medido (collab, vídeo enviado) fica fora e é contado.
 */
export default function AlcancePorPostCard({ posts = [] }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US'

  const medidos = posts.filter((p) => p.alcance != null && p.data)
  const foraDoGrafico = posts.length - medidos.length
  const dados = [...medidos]
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .map((p) => {
      const d = new Date(p.data)
      return {
        id: p.id,
        rotulo: d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' }),
        dataLonga: d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }),
        legenda: p.titulo,
        alcance: p.alcance,
        campanha: p.campanha,
      }
    })
  const temCampanha = dados.some((d) => d.campanha)

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardLabel>{t('influenciador.reachByPost.label')}</CardLabel>
          <CardTitle className="mt-1.5">{t('influenciador.reachByPost.title')}</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">
            {t('influenciador.reachByPost.subtitle', { n: dados.length })}
          </p>
        </div>
        {dados.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COR_POST }} />
              {t('influenciador.reachByPost.legendPost')}
            </span>
            {temCampanha && (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COR_CAMPANHA }} />
                {t('influenciador.reachByPost.legendCampaign')}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="-mx-2 mt-5">
        {dados.length === 0 ? (
          <EmptyState icon={BarChart3} title={t('influenciador.reachByPost.empty')} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dados} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.08} />
              <XAxis
                dataKey="rotulo"
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-text-muted"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={18}
              />
              <YAxis
                tickFormatter={abreviar}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-text-muted"
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                cursor={{ fill: 'currentColor', fillOpacity: 0.06 }}
                content={<Dica locale={locale} t={t} />}
              />
              <Bar dataKey="alcance" radius={[3, 3, 0, 0]} maxBarSize={18}>
                {dados.map((d) => (
                  <Cell key={d.id} fill={d.campanha ? COR_CAMPANHA : COR_POST} fillOpacity={d.campanha ? 1 : 0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {foraDoGrafico > 0 && (
        <p className="mt-3 text-xs text-text-muted">
          {t('influenciador.reachByPost.excluded', { count: foraDoGrafico })}
        </p>
      )}
    </Card>
  )
}
