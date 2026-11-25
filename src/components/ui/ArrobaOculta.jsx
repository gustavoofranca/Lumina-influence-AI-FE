import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import { MOSTRAR_HANDLE } from '../../lib/apresentacao.js'
import { ARROBA_OCULTA, normalizarArroba } from '../../lib/arroba.js'

/**
 * O @ do criador, escondido até alguém pedir — como o saldo no app do banco.
 *
 * O @ é o identificador público de uma pessoa real. Na tela de uma agência ele
 * aparece para quem passa atrás da cadeira, numa chamada com tela compartilhada
 * ou numa gravação; quem precisa dele clica no olho.
 *
 * - Começa escondido em todo carregamento: o estado é local, de propósito.
 * - Escondido, nada carrega o @ verdadeiro — nem `title`, nem rótulo acessível.
 *   O leitor de tela ouve "@ oculto".
 * - É privacidade de tela, não controle de acesso: o @ continua vindo na
 *   resposta da API para quem está logado, e a busca por @ continua valendo.
 * - `semBotao`: dentro de um botão ou de um link (cartões e listas de seleção),
 *   um botão aninhado é HTML inválido e roubaria o clique. Ali o @ fica só
 *   escondido; quem quiser vê-lo abre o perfil.
 * - No modo apresentação (`MOSTRAR_HANDLE` falso) o @ some por inteiro, como
 *   antes.
 */
export default function ArrobaOculta({ handle, className, semBotao = false }) {
  const { t } = useTranslation()
  const [revelado, setRevelado] = useState(false)
  const arroba = normalizarArroba(handle)
  if (!MOSTRAR_HANDLE || !arroba) return null

  const visivel = revelado && !semBotao
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1', className)}>
      {visivel ? (
        <span className="truncate">{arroba}</span>
      ) : (
        <>
          <span aria-hidden className="truncate tracking-wider">{ARROBA_OCULTA}</span>
          <span className="sr-only">{t('common.arroba.oculto')}</span>
        </>
      )}
      {!semBotao && (
        <button
          type="button"
          aria-pressed={revelado}
          aria-label={t('common.arroba.alternar')}
          onClick={(e) => {
            // Várias ocorrências estão em linhas e cartões clicáveis: revelar o
            // @ não pode abrir o perfil junto.
            e.preventDefault()
            e.stopPropagation()
            setRevelado((v) => !v)
          }}
          // Linhas de tabela navegam com Enter: a tecla no olho não pode subir.
          onKeyDown={(e) => e.stopPropagation()}
          className="shrink-0 rounded p-0.5 text-text-muted transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {revelado ? <EyeOff size={13} aria-hidden /> : <Eye size={13} aria-hidden />}
        </button>
      )}
    </span>
  )
}
