import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

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
        className={cn(
          'relative w-full animate-fade-in',
          'rounded-2xl border border-primary/15 bg-bg-surface shadow-glow-soft',
          SIZES[size]
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between gap-3 border-b border-hairline/60 px-6 py-4">
            {title ? (
              <h2 id="modal-title" className="font-display text-lg font-bold text-text-primary">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {showCloseButton ? (
              <IconButton icon={X} variant="ghost" size="sm" label="Fechar" onClick={onClose} />
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
