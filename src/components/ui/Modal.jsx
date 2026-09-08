import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { CloseCircle } from 'iconsax-reactjs'

import { cn } from '../../lib/cn.js'
import IconButton from './IconButton.jsx'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

/**
 * Modal — overlay com blur + card central com fade+scale.
 * Renderiza em portal no body. Trava scroll quando aberto.
 * Fecha por ESC e clique no overlay.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) {
  const { t } = useTranslation()
  const cardRef = useRef(null)
  const focoAnterior = useRef(null)

  // Trava scroll do body
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  // ESC fecha
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Foco: leva para dentro ao abrir, prende enquanto está aberto e devolve ao
  // fechar. Sem isso, `aria-modal` promete um confinamento que não existe — o
  // Tab passeia pela página bloqueada atrás do overlay e quem usa teclado ou
  // leitor de tela não alcança o formulário.
  useEffect(() => {
    if (!open) return
    focoAnterior.current = document.activeElement

    const focaveis = () =>
      [...(cardRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? [])].filter((el) => el.offsetParent !== null)

    const primeiros = focaveis()
    ;(primeiros[0] ?? cardRef.current)?.focus()

    const prender = (e) => {
      if (e.key !== 'Tab') return
      const alvos = focaveis()
      if (!alvos.length) {
        e.preventDefault()
        return
      }
      const primeiro = alvos[0]
      const ultimo = alvos[alvos.length - 1]
      const atual = document.activeElement
      if (e.shiftKey && (atual === primeiro || !cardRef.current?.contains(atual))) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && atual === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', prender, true)
    return () => {
      document.removeEventListener('keydown', prender, true)
      focoAnterior.current?.focus?.()
    }
  }, [open])

  if (!open) return null

  const modal = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label={t('common.a11y.close')}
        onClick={() => closeOnOverlayClick && onClose?.()}
        className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
        tabIndex={-1}
      />

      {/* Card */}
      <div
        ref={cardRef}
        tabIndex={-1}
        className={cn(
          'relative w-full animate-fade-in outline-none',
          'rounded-janela border border-[color:var(--border-subtle)] bg-bg-surface shadow-3',
          SIZES[size]
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between gap-3 border-b border-hairline/60 px-6 py-4">
            {title ? (
              <h2 id="modal-title" className="tipo-secao text-text-primary">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {showCloseButton ? (
              <IconButton icon={CloseCircle} variant="ghost" size="sm" label={t('common.a11y.close')} onClick={onClose} />
            ) : null}
          </div>
        )}

        <div className="px-6 py-5">{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-hairline/60 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
