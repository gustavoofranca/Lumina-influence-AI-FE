import { forwardRef, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays } from 'lucide-react'

import Input from './Input.jsx'

/** "2026-09-16" → "16/09/2026". */
export function isoParaBr(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

/** "16/09/2026" → "2026-09-16"; data incompleta ou inexistente → ''. */
export function brParaIso(br) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br || '')
  if (!m) return ''
  const [, d, mes, a] = m
  const data = new Date(Date.UTC(+a, +mes - 1, +d))
  // 31/02 vira 03/03 no Date; conferir de volta recusa a data inventada.
  if (data.getUTCDate() !== +d || data.getUTCMonth() !== +mes - 1) return ''
  return `${a}-${mes}-${d}`
}

function mascarar(texto) {
  const digitos = texto.replace(/\D/g, '').slice(0, 8)
  return [digitos.slice(0, 2), digitos.slice(2, 4), digitos.slice(4)].filter(Boolean).join('/')
}

/**
 * Campo de data sempre em dd/mm/aaaa.
 *
 * O `type="date"` nativo desenha a data no formato do idioma do navegador —
 * num navegador em inglês a campanha aparecia como mm/dd/yyyy, e isso o site
 * não controla. Aqui o texto é mascarado à mão e o calendário nativo continua
 * disponível pelo botão.
 *
 * O contrato com quem usa não muda: `value` entra e `onChange` sai em ISO
 * (aaaa-mm-dd), como no input nativo. Enquanto a data está incompleta o valor
 * emitido é '', a mesma coisa que o nativo emite.
 */
const DateInput = forwardRef(function DateInput({ value, onChange, error, ...rest }, ref) {
  const { t } = useTranslation()
  const [texto, setTexto] = useState(isoParaBr(value))
  // Data completa que não existe (31/06) emite '' como a incompleta, e o
  // formulário respondia "campo obrigatório" com o campo preenchido.
  const invalida = texto.length === 10 && !brParaIso(texto)
  const nativo = useRef(null)

  // Valor trocado de fora (carregar campanha, limpar formulário). Não atropela
  // a digitação: enquanto o texto parcial corresponde a '', ele fica.
  useEffect(() => {
    if (value !== brParaIso(texto)) setTexto(isoParaBr(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const emitir = (iso) => onChange?.({ target: { value: iso } })

  const digitar = (e) => {
    const novo = mascarar(e.target.value)
    setTexto(novo)
    const iso = brParaIso(novo)
    if (iso !== (value || '')) emitir(iso)
  }

  const abrirCalendario = () => {
    const el = nativo.current
    if (!el) return
    try { el.showPicker() } catch { el.focus() }
  }

  return (
    <Input
      ref={ref}
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      maxLength={10}
      value={texto}
      onChange={digitar}
      rightAdornment={
        <span className="relative inline-flex">
          <button
            type="button"
            onClick={abrirCalendario}
            className="rounded-md p-1 text-text-muted transition-colors hover:text-accent"
            aria-label={t('common.openCalendar')}
            tabIndex={-1}
          >
            <CalendarDays size={16} />
          </button>
          <input
            ref={nativo}
            type="date"
            tabIndex={-1}
            aria-hidden="true"
            value={value || ''}
            onChange={(e) => { setTexto(isoParaBr(e.target.value)); emitir(e.target.value) }}
            className="pointer-events-none absolute inset-0 opacity-0"
          />
        </span>
      }
      {...rest}
      error={invalida ? t('common.invalidDate') : error}
    />
  )
})

export default DateInput
