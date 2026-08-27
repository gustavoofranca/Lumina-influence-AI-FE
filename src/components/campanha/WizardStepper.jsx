import { Check } from 'lucide-react'

import { cn } from '../../lib/cn.js'

/**
 * WizardStepper — barra horizontal mostrando passos do wizard.
 * steps = [{ key, label }]
 * currentStep = 1..N (1-indexado)
 */
export default function WizardStepper({ steps, currentStep }) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((step, i) => {
        const num     = i + 1
        const done    = num < currentStep
        const active  = num === currentStep

        return (
          <li key={step.key} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                'ring-1 ring-inset transition-all duration-200',
                done   && 'bg-emerald-500/20 text-positive ring-emerald-500/40',
                active && 'bg-primary-600 text-white ring-primary-400 shadow-glow-soft',
                !done && !active && 'bg-bg-surface text-text-muted ring-hairline'
              )}
            >
              {done ? <Check size={14} /> : num}
            </span>

            <span className={cn(
              'min-w-0 truncate text-xs font-semibold uppercase tracking-label transition-colors',
              active ? 'text-text-primary' : done ? 'text-positive' : 'text-text-muted'
            )}>
              {step.label}
            </span>

            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'h-px flex-1 transition-colors duration-200',
                  done ? 'bg-emerald-500/40' : 'bg-bg-elevated'
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
