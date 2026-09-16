import { useTranslation } from 'react-i18next'
import { ShieldCheck, FlaskConical, Database, ScanSearch } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'

/**
 * Procedência do dado.
 *
 * Todo o resto do painel soma. Este cartão **separa** — e é a única tela que
 * responde "de onde veio este número?" sem que o usuário precise abrir criador
 * por criador.
 *
 * A razão de existir é a mesma do selo de demonstração no cartão de conexão,
 * levada um nível acima: um indicador que junta coleta real, dado de
 * demonstração e carga inicial sem dizer qual é qual apresenta como medido o
 * que não foi medido. Num produto de auditoria de métrica, esse é o defeito
 * mais caro possível — é o que o produto acusa nos outros.
 */

const GRUPOS = [
  {
    chave: 'real',
    icone: ShieldCheck,
    cor: 'text-positive',
    fundo: 'bg-emerald-500/12',
    anel: 'ring-emerald-500/25',
    barra: 'bg-emerald-500',
  },
  {
    chave: 'demo',
    icone: FlaskConical,
    cor: 'text-caution',
    fundo: 'bg-amber-500/12',
    anel: 'ring-amber-500/25',
    barra: 'bg-amber-500',
  },
  {
    chave: 'sem_coleta',
    icone: Database,
    cor: 'text-text-muted',
    fundo: 'bg-bg-elevated/70',
    anel: 'ring-hairline/50',
    // `bg-track` desaparecia: é a cor do próprio fundo da barra, e o segmento
    // sumia. `nao-medido` é o token que o produto já usa para "isto não foi
    // medido" — exatamente o que este grupo significa.
    barra: 'bg-nao-medido',
  },
]

function formatarData(iso, idioma) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString(idioma === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return null
  }
}

export default function ProcedenciaCard({ data, loading = false }) {
  const { t, i18n } = useTranslation()

  if (loading) {
    return (
      <Card className="flex flex-col gap-4 p-[18px]">
        <CardLabel>{t('dashboard.procedencia.label')}</CardLabel>
        <Skeleton className="h-3 w-full" rounded="rounded-full" />
        <Skeleton className="h-24" rounded="rounded-xl" />
      </Card>
    )
  }

  if (!data || !data.total_contas) {
    return (
      <Card className="p-[18px]">
        <CardLabel>{t('dashboard.procedencia.label')}</CardLabel>
        <EmptyState icon={ScanSearch} title={t('dashboard.procedencia.empty')} />
      </Card>
    )
  }

  const total = data.total_posts || 0
  const ultimaColeta = formatarData(data.ultima_coleta_real, i18n.language)

  return (
    <Card className="flex flex-col gap-4 p-[18px]">
      <div>
        <CardLabel>{t('dashboard.procedencia.label')}</CardLabel>
        <CardTitle className="mt-1.5">{t('dashboard.procedencia.title')}</CardTitle>
        <p className="tipo-corpo mt-1 text-text-secondary">
          {t('dashboard.procedencia.subtitle')}
        </p>
      </div>

      {/* Barra proporcional: a leitura de relance é "quanto do que estou vendo
          foi medido de verdade". */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-track">
        {GRUPOS.map(({ chave, barra }) => {
          const posts = data[chave]?.posts || 0
          if (!posts || !total) return null
          return (
            <div
              key={chave}
              className={cn('h-full', barra)}
              style={{ width: `${(posts / total) * 100}%` }}
              title={t(`dashboard.procedencia.grupos.${chave}`)}
            />
          )
        })}
      </div>

      <ul className="flex flex-col gap-2">
        {GRUPOS.map(({ chave, icone: Icone, cor, fundo, anel }) => {
          const grupo = data[chave] || { contas: 0, posts: 0 }
          return (
            <li
              key={chave}
              className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-inset', fundo, anel)}
            >
              <span className={cn('shrink-0', cor)}>
                <Icone size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-text-primary">
                  {t(`dashboard.procedencia.grupos.${chave}`)}
                </span>
                <span className="block text-xs text-text-secondary">
                  {t('dashboard.procedencia.detalhe', {
                    contas: grupo.contas,
                    posts: grupo.posts,
                    count: grupo.contas,
                  })}
                </span>
              </div>
              <span className="numerico shrink-0 font-display text-xl font-bold text-text-primary">
                {grupo.posts}
              </span>
            </li>
          )
        })}
      </ul>

      <p className="tipo-corpo text-xs text-text-muted">
        {/* Sem coleta real, a tela diz isso — e não uma data de preenchimento. */}
        {ultimaColeta
          ? t('dashboard.procedencia.ultimaColeta', { data: ultimaColeta })
          : t('dashboard.procedencia.semColetaReal')}
      </p>
    </Card>
  )
}
