import { cn } from '../../lib/cn.js'

import simboloCor from '../../assets/brand/lumina-symbol-600.png'
import simboloPreto from '../../assets/brand/lumina-symbol-black-600.png'
import simboloBranco from '../../assets/brand/lumina-symbol-white-600.png'
import icone from '../../assets/brand/lumina-icon-192.png'

const ARTE = {
  brand: simboloCor,
  black: simboloPreto,
  white: simboloBranco,
}

/**
 * LuminaMark — a marca, na arte original.
 *
 * É imagem, não desenho vetorial reconstruído: o brilho e o degradê do anel são
 * a identidade, e redesenhá-los aproximava sem chegar lá.
 *
 * tone: 'brand' (colorida) | 'black' | 'white'
 * as:   'symbol' (padrão, horizontal) | 'icon' (quadrado de cantos arredondados)
 */
export default function LuminaMark({
  tone = 'brand',
  as = 'symbol',
  className = '',
  alt = '',
  ...rest
}) {
  const src = as === 'icon' ? icone : (ARTE[tone] || ARTE.brand)
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable="false"
      className={cn('block h-auto select-none', className)}
      {...rest}
    />
  )
}
