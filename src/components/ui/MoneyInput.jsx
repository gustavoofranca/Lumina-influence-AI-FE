import { forwardRef } from 'react'

import Input from './Input.jsx'
import { formatarReais, reaisDeDigitos, reaisDeTextoColado } from '../../lib/dinheiro.js'

/**
 * Substituto direto de `<Input type="number">` para reais. Mesmo contrato:
 * `value` e `e.target.value` em reais com ponto decimal ("1500.50") ou "".
 * Ver `lib/dinheiro.js` para o porquê.
 */
const MoneyInput = forwardRef(function MoneyInput({ value, onChange, ...rest }, ref) {
  const emitir = (reais) => onChange?.({ target: { value: reais } })

  return (
    <Input
      ref={ref}
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={formatarReais(value)}
      onChange={(e) => emitir(reaisDeDigitos(e.target.value))}
      onPaste={(e) => {
        e.preventDefault()
        emitir(reaisDeTextoColado(e.clipboardData.getData('text')))
      }}
    />
  )
})

export default MoneyInput
