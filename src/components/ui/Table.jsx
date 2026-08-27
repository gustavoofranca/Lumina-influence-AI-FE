import { cn } from '../../lib/cn.js'
import { useTranslation } from 'react-i18next'

/**
 * Table — tabela leve para listagens internas.
 *
 * Props:
 *   columns = [{ key, header, align?, width?, render?(row) }]
 *   data    = []
 *   onRowClick?(row, index)
 *   getRowKey?(row, index) -> string
 *   emptyState?: ReactNode
 */
const ALIGN = {
  left:   'text-left',
  right:  'text-right',
  center: 'text-center',
}

export default function Table({
  columns = [],
  data = [],
  onRowClick,
  getRowKey,
  emptyState = null,
  className = '',
  dense = false,
}) {
  const { t } = useTranslation()
  const empty = data.length === 0

  return (
    // min-w-0: filho de grid/flex não encolhe abaixo do conteúdo sem isso, e
    // o overflow-x-auto de dentro nunca chega a valer.
    <div className={cn('min-w-0 overflow-hidden rounded-2xl border border-neutral-700/60', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-neutral-800/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'border-b border-neutral-700/60 px-4 py-3 text-[11px] font-semibold uppercase tracking-label text-text-label',
                    ALIGN[col.align || 'left']
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {empty ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-text-muted">
                  {emptyState || t('common.noRecords')}
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const key = getRowKey ? getRowKey(row, i) : (row.id ?? i)
                const clickable = !!onRowClick
                return (
                  <tr
                    key={key}
                    onClick={clickable ? () => onRowClick(row, i) : undefined}
                    // Linha clicável precisa de foco e de Enter/Espaço: só
                    // onClick a deixa acessível apenas por mouse.
                    tabIndex={clickable ? 0 : undefined}
                    role={clickable ? 'button' : undefined}
                    onKeyDown={
                      clickable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onRowClick(row, i)
                            }
                          }
                        : undefined
                    }
                    className={cn(
                      'border-b border-neutral-800/80 last:border-0 transition-colors',
                      clickable &&
                        'cursor-pointer hover:bg-neutral-700/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 text-sm text-neutral-200',
                          dense ? 'py-2' : 'py-3.5',
                          ALIGN[col.align || 'left']
                        )}
                      >
                        {col.render ? col.render(row, i) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
