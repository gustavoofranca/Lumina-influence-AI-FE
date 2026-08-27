import { cn } from '../../lib/cn.js'

/**
 * LuminaMark — o símbolo da marca.
 *
 * Inline em vez de <img>: assim a versão `mono` herda a cor do contexto e
 * acompanha o tema, e o SVG não vira mais uma requisição.
 *
 * tone:
 *   'brand' (padrão) — gradiente da marca
 *   'mono'           — uma cor só, herdada via currentColor
 *
 * compact: versão de três sinais, para uso pequeno. Abaixo de ~40px os cinco
 * sinais viram um borrão cinza; a leitura que precisa sobreviver é "íris com
 * sinais saindo", e ela sobrevive com três.
 */
export default function LuminaMark({ tone = 'brand', compact = false, className = '', title, ...rest }) {
  const id = tone === 'brand' ? 'lm' : null
  if (compact) return <MarcaCompacta id={id} className={className} title={title} {...rest} />
  return (
    <svg
      viewBox="0 0 424 256"
      className={cn('block', className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {id && (
        <defs>
          <linearGradient id={`${id}-topo`} x1="84" y1="128" x2="276" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.02" stopColor="#DDD6FE" />
            <stop offset="0.16" stopColor="#8B5CF6" />
            <stop offset="0.58" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#2E1065" />
          </linearGradient>
          <linearGradient id={`${id}-base`} x1="84" y1="128" x2="276" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.02" stopColor="#DDD6FE" />
            <stop offset="0.18" stopColor="#8B5CF6" />
            <stop offset="0.66" stopColor="#0EA5E9" />
            <stop offset="1" stopColor="#F43F5E" />
          </linearGradient>
          <linearGradient id={`${id}-feixe`} x1="84" y1="128" x2="402" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.55" stopColor="#67E8F9" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
          <radialGradient id={`${id}-brilho`} cx="84" cy="128" r="22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.4" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}

      <path
        d="M84 128 A96 96 0 0 1 274.54 111.33"
        fill="none" strokeWidth="16" strokeLinecap="round"
        stroke={id ? `url(#${id}-topo)` : 'currentColor'}
      />
      <path
        d="M84 128 A96 96 0 0 0 274.54 144.67"
        fill="none" strokeWidth="16" strokeLinecap="round"
        stroke={id ? `url(#${id}-base)` : 'currentColor'}
      />
      <path
        d="M10 128 H84" strokeWidth="3" strokeLinecap="round"
        stroke={id ? '#FFFFFF' : 'currentColor'} opacity={id ? 0.55 : 0.45}
      />

      <g strokeWidth="5" strokeLinecap="round" fill="none" stroke="currentColor">
        <path d="M84 128 H402" stroke={id ? `url(#${id}-feixe)` : 'currentColor'} />
        <path d="M281.99 86.79 L348.75 59.82" stroke={id ? '#8B5CF6' : 'currentColor'} />
        <path d="M287.98 107.01 L358.66 93.27" stroke={id ? '#D946EF' : 'currentColor'} />
        <path d="M287.98 148.99 L358.66 162.73" stroke={id ? '#FB7185' : 'currentColor'} />
        <path d="M281.99 169.21 L348.75 196.18" stroke={id ? '#F43F5E' : 'currentColor'} />
      </g>
      <g fill="currentColor">
        <circle cx="276" cy="128" r="8" fill={id ? '#22D3EE' : 'currentColor'} />
        <circle cx="348.75" cy="59.82" r="8" fill={id ? '#8B5CF6' : 'currentColor'} />
        <circle cx="358.66" cy="93.27" r="8" fill={id ? '#D946EF' : 'currentColor'} />
        <circle cx="402" cy="128" r="8" fill={id ? '#22D3EE' : 'currentColor'} />
        <circle cx="358.66" cy="162.73" r="8" fill={id ? '#FB7185' : 'currentColor'} />
        <circle cx="348.75" cy="196.18" r="8" fill={id ? '#F43F5E' : 'currentColor'} />
      </g>

      {id && <circle cx="84" cy="128" r="22" fill={`url(#${id}-brilho)`} />}
      <circle cx="84" cy="128" r={id ? 10 : 14} fill={id ? '#FFFFFF' : 'currentColor'} />
    </svg>
  )
}

function MarcaCompacta({ id, className, title, ...rest }) {
  return (
    <svg
      viewBox="90 150 340 214"
      className={cn('block', className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {id && (
        <defs>
          <linearGradient id={`${id}c-topo`} x1="124" y1="256" x2="334" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.05" stopColor="#DDD6FE" />
            <stop offset="0.36" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id={`${id}c-base`} x1="124" y1="256" x2="334" y2="332" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.05" stopColor="#DDD6FE" />
            <stop offset="0.38" stopColor="#8B5CF6" />
            <stop offset="0.74" stopColor="#0EA5E9" />
            <stop offset="1" stopColor="#F43F5E" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M124 256 A106 106 0 0 1 334.4 237.6"
        fill="none" strokeWidth="28" strokeLinecap="round"
        stroke={id ? `url(#${id}c-topo)` : 'currentColor'}
      />
      <path
        d="M124 256 A106 106 0 0 0 334.4 274.4"
        fill="none" strokeWidth="28" strokeLinecap="round"
        stroke={id ? `url(#${id}c-base)` : 'currentColor'}
      />
      <g strokeWidth="17" strokeLinecap="round" fill="none">
        <path d="M124 256 H400" stroke={id ? '#22D3EE' : 'currentColor'} />
        <path d="M328.9 203.4 L380.1 176.2" stroke={id ? '#A78BFA' : 'currentColor'} />
        <path d="M328.9 308.6 L380.1 335.8" stroke={id ? '#FB7185' : 'currentColor'} />
      </g>
      <g>
        <circle cx="400" cy="256" r="18" fill={id ? '#22D3EE' : 'currentColor'} />
        <circle cx="380.1" cy="176.2" r="18" fill={id ? '#A78BFA' : 'currentColor'} />
        <circle cx="380.1" cy="335.8" r="18" fill={id ? '#FB7185' : 'currentColor'} />
      </g>
      <circle cx="124" cy="256" r="27" fill={id ? '#FFFFFF' : 'currentColor'} />
    </svg>
  )
}
