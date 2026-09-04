import { useScrollReveal }  from '../hooks/useScrollReveal.js'
import { useRolagemSuave } from '../hooks/useRolagemSuave.js'
import { useLuzDoPonteiro } from '../hooks/useLuzDoPonteiro.js'
import FundoEstrelado      from '../components/landing/FundoEstrelado.jsx'
import LuzDoPonteiro       from '../components/landing/LuzDoPonteiro.jsx'
import HeaderSection        from '../components/landing/HeaderSection.jsx'
import HeroSection          from '../components/landing/HeroSection.jsx'
import LogosSection         from '../components/landing/LogosSection.jsx'
import ProvaSection         from '../components/landing/ProvaSection.jsx'
import ComparativoSection   from '../components/landing/ComparativoSection.jsx'
import PilaresSection       from '../components/landing/PilaresSection.jsx'
import NumerosSection       from '../components/landing/NumerosSection.jsx'
import PlansSection         from '../components/landing/PlansSection.jsx'
import FaqSection           from '../components/landing/FaqSection.jsx'
import FooterSection        from '../components/landing/FooterSection.jsx'
import { useDarkOnly } from '../hooks/useDarkOnly.js'

export default function LandingPage() {
  useDarkOnly()
  useScrollReveal()
  useRolagemSuave()
  useLuzDoPonteiro()

  return (
    // `overflow-x-clip` e não `hidden`: o lavado das seções transborda a
    // caixa de propósito, para morrer fora dela em vez de deixar aresta, e
    // isso esticava o documento além da janela — 1372px numa janela de 1280.
    // A página passava a rolar na horizontal, e tudo que se posiciona pela
    // janela (estrelas, auras, fios) parava em 1280: a luz aparecia cortada
    // numa linha reta. `clip` recorta sem criar contêiner de rolagem, então
    // o `sticky` do FAQ continua funcionando — `hidden` o quebraria.
    <div className="relative min-h-screen overflow-x-clip bg-landing-bg font-sans text-landing-text">
      <FundoEstrelado />
      {/* Depois das estrelas e antes do conteúdo, e é aí que está o efeito: a
          luz fica atrás dos cartões, então o `backdrop-filter` deles a borra e
          a desloca no caminho. Por cima, ela cobriria o texto e passaria na
          frente do vidro em vez de atravessá-lo. */}
      <LuzDoPonteiro />
      {/* Todo o conteúdo sobe uma camada: o fundo é `fixed` na camada 0. */}
      <div className="relative z-10">
      <HeaderSection />
      {/* Um marco de conteúdo: sem ele o leitor de tela não tem como pular a
          navegação e cair no miolo da página. */}
      <main>
      {/* A ordem é o argumento: o que é (herói) → mostre funcionando (prova) →
          por que confiar (comparativo, pilares, números) → quanto custa. A
          página não tinha o segundo passo: falava do sistema sem nunca
          mostrá-lo. */}
      <HeroSection />
      <LogosSection />
      <ProvaSection />
      <ComparativoSection />
      <PilaresSection />
      <NumerosSection />
      <PlansSection />
      <FaqSection />
      </main>
      <FooterSection />
      </div>
    </div>
  )
}
