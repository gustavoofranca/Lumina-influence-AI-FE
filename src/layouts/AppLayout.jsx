import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar  from '../components/layout/Topbar.jsx'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg-base text-text-primary">
      {/* Atrás de tudo, fixo: a barra lateral e o topo são vidro e precisam de
          algo com profundidade passando por baixo. */}
      <div aria-hidden className="fundo-app pointer-events-none fixed inset-0" />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Área principal — offset da sidebar em lg */}
      {/* min-w-0: este é item de um flex em linha (sidebar + conteúdo). Sem
          ele, o invólucro nunca encolhe abaixo da largura mínima do conteúdo,
          e qualquer texto com `truncate` (que implica nowrap) empurra a
          página inteira num celular. Era a causa única de todas as telas que
          estouravam a viewport. */}
      {/* relative: sem posicionamento, o fundo fixo acima pintaria por cima
          deste bloco, que vem depois dele no fluxo. */}
      <div className="relative flex min-w-0 flex-1 flex-col lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
