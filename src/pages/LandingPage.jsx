import { useScrollReveal }  from '../hooks/useScrollReveal.js'
import HeaderSection        from '../components/landing/HeaderSection.jsx'
import HeroSection          from '../components/landing/HeroSection.jsx'
import LogosSection         from '../components/landing/LogosSection.jsx'
import ComparativoSection   from '../components/landing/ComparativoSection.jsx'
import PilaresSection       from '../components/landing/PilaresSection.jsx'
import PlansSection         from '../components/landing/PlansSection.jsx'
import FooterSection        from '../components/landing/FooterSection.jsx'
import { useDarkOnly } from '../hooks/useDarkOnly.js'

export default function LandingPage() {
  useDarkOnly()
  useScrollReveal()

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <HeaderSection />
      <HeroSection />
      <LogosSection />
      <ComparativoSection />
      <PilaresSection />
      <PlansSection />
      <FooterSection />
    </div>
  )
}
