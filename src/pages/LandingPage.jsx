import { useScrollReveal }  from '../hooks/useScrollReveal.js'
import FundoEstrelado      from '../components/landing/FundoEstrelado.jsx'
import HeaderSection        from '../components/landing/HeaderSection.jsx'
import HeroSection          from '../components/landing/HeroSection.jsx'
import LogosSection         from '../components/landing/LogosSection.jsx'
import ComparativoSection   from '../components/landing/ComparativoSection.jsx'
import PilaresSection       from '../components/landing/PilaresSection.jsx'
import PlansSection         from '../components/landing/PlansSection.jsx'
import FaqSection           from '../components/landing/FaqSection.jsx'
import FooterSection        from '../components/landing/FooterSection.jsx'
import { useDarkOnly } from '../hooks/useDarkOnly.js'

export default function LandingPage() {
  useDarkOnly()
  useScrollReveal()

  return (
    <div className="relative min-h-screen bg-landing-bg font-sans text-landing-text">
      <FundoEstrelado />
      {/* Todo o conteúdo sobe uma camada: o fundo é `fixed` na camada 0. */}
      <div className="relative z-10">
      <HeaderSection />
      {/* Um marco de conteúdo: sem ele o leitor de tela não tem como pular a
          navegação e cair no miolo da página. */}
      <main>
      <HeroSection />
      <LogosSection />
      <ComparativoSection />
      <PilaresSection />
      <PlansSection />
      <FaqSection />
      </main>
      <FooterSection />
      </div>
    </div>
  )
}
