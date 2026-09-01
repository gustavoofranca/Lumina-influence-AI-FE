import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const PRODUTO = 'Lumina Influence AI'

/**
 * Mantém `document.title` coerente com a rota.
 *
 * Numa aplicação de página única a navegação não recarrega nada, e o título
 * fica congelado no que veio do HTML. Para quem enxerga a tela isso é um
 * detalhe do navegador; para quem usa leitor de tela é o **anúncio de
 * chegada** — sem ele, ir do dashboard para relatórios não anuncia nada, e
 * todas as telas se apresentam com o mesmo nome.
 *
 * Fica centralizado, e não espalhado em `useEffect` por página: título é
 * propriedade da rota, e uma tabela ao lado da tabela de rotas é o que mantém
 * as duas em dia. Rota nova sem entrada aqui cai no nome do produto — degrada
 * para o comportamento antigo em vez de quebrar.
 */
const CHAVE_POR_ROTA = [
  ['/app/dashboard',        'titulos.dashboard'],
  ['/welcome',              'titulos.welcome'],
  ['/design-system',        'titulos.designSystem'],
  ['/app/influenciadores',  'titulos.influenciadores'],
  ['/app/campanhas/nova',   'titulos.novaCampanha'],
  ['/app/campanhas',        'titulos.campanhas'],
  ['/app/diagnostico',      'titulos.diagnostico'],
  ['/app/relatorios/novo',  'titulos.novoRelatorio'],
  ['/app/relatorios',       'titulos.relatorios'],
  ['/app/configuracoes',    'titulos.configuracoes'],
  ['/login',                'titulos.login'],
  ['/cadastro',             'titulos.cadastro'],
  ['/primeiro-acesso',      'titulos.primeiroAcesso'],
  ['/privacidade',          'legal.privacy.title'],
  ['/termos',               'legal.terms.title'],
  ['/exclusao-de-dados',    'legal.deletion.title'],
  // A raiz fica por último: `startsWith('/')` casaria com tudo.
  ['/',                     'titulos.landing'],
]

export default function TituloDaPagina() {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()

  useEffect(() => {
    // A lista está da rota mais específica para a mais genérica: `/campanhas/nova`
    // precisa ganhar de `/campanhas`.
    const par = CHAVE_POR_ROTA.find(([prefixo]) => pathname.startsWith(prefixo))
    if (!par) {
      document.title = PRODUTO
      return
    }
    const nome = t(par[1], { defaultValue: '' })
    document.title = nome ? `${nome} · ${PRODUTO}` : PRODUTO
  }, [pathname, t, i18n.language])

  return null
}
