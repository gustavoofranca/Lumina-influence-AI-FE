import { cn } from '../../lib/cn.js'

/** Aviso das telas de entrada: erro (`role="alert"`) ou confirmação (`role="status"`). */
export default function AvisoDeEntrada({ tipo = 'erro', children, className }) {
  return (
    <div
      role={tipo === 'erro' ? 'alert' : 'status'}
      className={cn(
        'rounded-lg px-3 py-2 text-xs',
        tipo === 'erro' ? 'bg-tertiary-500/10 text-tint-rose' : 'bg-emerald-500/10 text-emerald-300',
        className
      )}
    >
      {children}
    </div>
  )
}
