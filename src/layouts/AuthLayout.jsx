import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import LanguageSwitcher from '../components/ui/LanguageSwitcher.jsx'
import StatusIndicator from '../components/ui/StatusIndicator.jsx'
import LuminaWordmark from '../components/ui/LuminaWordmark.jsx'
import FundoEstrelado from '../components/landing/FundoEstrelado.jsx'
import LuzDoPonteiro from '../components/landing/LuzDoPonteiro.jsx'
import CartaoDeVidro from '../components/landing/CartaoDeVidro.jsx'
import { useLuzDoPonteiro } from '../hooks/useLuzDoPonteiro.js'
import { useDarkOnly } from '../hooks/useDarkOnly.js'

/**
 * Casca das telas de entrada: login, cadastro, retorno do OAuth e primeiro
 * acesso.
 *
 * Ela agora usa a mesma linguagem da landing, e não uma aproximação dela. Quem
 * chega aqui vem da página pública, quase sempre clicando num botão que estava
 * sobre o campo de estrelas; trocar de mundo visual no meio do caminho lê como
 * ter saído do site.
 *
 * O que veio de lá, inteiro e não recriado:
 *
 * - **O fundo** é o mesmo campo de estrelas, com a mesma luz seguindo o
 *   ponteiro. Antes eram dois brilhos radiais parados, que imitavam a landing
 *   de longe e não acompanhavam nenhuma mudança dela.
 * - **O cartão** é o `CartaoDeVidro`, o mesmo dos planos e dos pilares. A luz
 *   do ponteiro passa por trás dele e o vidro refrata — que é o efeito inteiro.
 * - **O seletor de idioma** é a variante de vidro, a mesma da barra do topo.
 *
 * ## `useDarkOnly` mora aqui, e não em cada página
 *
 * A paleta `landing-*` é escura por definição: não existe versão dela para o
 * tema claro. Login e cadastro já forçavam o tema escuro por conta própria;
 * o retorno do OAuth e o primeiro acesso **não** — e passariam a desenhar
 * cores de fundo escuro sob um tema claro. Como a decisão é da casca, ela
 * pertence à casca.
 */
export default function AuthLayout({ children }) {
  const { t } = useTranslation()
  useDarkOnly()
  useLuzDoPonteiro()

  return (
    <div className={
      'relative flex min-h-screen flex-col items-center justify-center overflow-x-clip ' +
      'bg-landing-bg px-4 py-12 font-sans text-landing-text'
    }>
      <FundoEstrelado />
      {/* Atrás do conteúdo e à frente das estrelas: é essa ordem que faz o
          `backdrop-filter` do cartão ter o que borrar. Ver `LuzDoPonteiro`. */}
      <LuzDoPonteiro />

      {/* Todo o conteúdo sobe uma camada: os dois fundos são `fixed` na 0. */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="mb-8 flex w-full items-center justify-between">
          <Link to="/" aria-label="Lumina AI">
            <LuminaWordmark tamanho="text-[1.6rem]" />
          </Link>
          <LanguageSwitcher variant="vidro" />
        </div>

        {/* `main` e não `div`: é o marco que leva o leitor de tela direto ao
            formulário, pulando cabeçalho e decoração. Login e cadastro eram as
            únicas telas do produto sem nenhum marco de conteúdo. */}
        <main className="w-full">
          <CartaoDeVidro interno="!p-8">{children}</CartaoDeVidro>
        </main>

        <div className="mt-8">
          <StatusIndicator label={t('status.operational')} color="success" />
        </div>
      </div>
    </div>
  )
}
