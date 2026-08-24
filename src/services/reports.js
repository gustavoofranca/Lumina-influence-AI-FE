/** Serviço de relatórios — lista, gera e baixa o PDF real. */
import { api, getAccessToken } from '../lib/api.js'

export function adaptReport(r) {
  const included = r.sections?.included || []
  return {
    id: r.id,
    name: r.title,
    campaignId: r.campaign_id,
    period: { start: r.period_start, end: r.period_end },
    pages: r.sections?.page_count || (included.length + 1),
    createdAt: r.generated_at,
    generatedBy: 'Equipe',
    sections: included,
    pdfUrl: r.pdf_url,
  }
}

export async function listReports() {
  const res = await api.get('/reports', { params: { per_page: 100 } })
  return res.data.map(adaptReport)
}

export async function createReport({ campaignId, title, periodStart, periodEnd, sections }) {
  const res = await api.post('/reports', {
    campaign_id: campaignId,
    title,
    period_start: periodStart,
    period_end: periodEnd,
    sections,
  })
  return adaptReport(res.data)
}

/**
 * Conteúdo do relatório para a prévia — mesma fonte que gera o PDF.
 * Não grava nada: só monta o documento com os dados atuais da campanha.
 */
export async function previewReport({ campaignId, title, periodStart, periodEnd, sections }) {
  const res = await api.post('/reports/preview', {
    campaign_id: campaignId,
    title,
    period_start: periodStart,
    period_end: periodEnd,
    sections,
  })
  return res.data
}

/** Baixa o PDF (com Authorization) e dispara o download no browser. */
export async function downloadReport(id, filename = 'relatorio.pdf') {
  const resp = await api.raw(`/reports/${id}/download`)
  if (!resp.ok) throw new Error('Não foi possível baixar o relatório.')
  const blob = await resp.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
