/** Linha com texto no meio ("ou") entre formas de entrar. */
export default function Divisor({ children }) {
  return (
    <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-landing-muted">
      <span className="h-px flex-1 bg-white/10" />
      {children}
      <span className="h-px flex-1 bg-white/10" />
    </div>
  )
}
