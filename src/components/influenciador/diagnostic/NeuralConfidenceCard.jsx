import { useTranslation } from 'react-i18next'
import { BrainCircuit } from 'lucide-react'

import Card, { CardLabel, CardTitle } from '../../ui/Card.jsx'
import ProgressBar from '../../ui/ProgressBar.jsx'
import EmptyState from '../../ui/EmptyState.jsx'
import Skeleton from '../../ui/Skeleton.jsx'

export default function NeuralConfidenceCard({ data, loading = false }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card glass className="flex flex-col gap-5">
        <CardLabel>{t('influenciador.neuralConfidence.title')}</CardLabel>
        <Skeleton className="h-32" rounded="rounded-xl" />
      </Card>
    )
  }

  if (!data?.length) {
    return (
      <Card glass className="flex flex-col gap-5">
        <CardLabel>{t('influenciador.neuralConfidence.title')}</CardLabel>
        <EmptyState icon={BrainCircuit} title={t('influenciador.neuralConfidence.empty')} />
      </Card>
    )
  }

  return (
    <Card glass className="flex flex-col gap-5">
      <div>
        <CardLabel>{t('influenciador.neuralConfidence.title')}</CardLabel>
        <CardTitle className="mt-1.5">{t('influenciador.neuralConfidence.title')}</CardTitle>
        <p className="mt-1 text-sm text-text-secondary">{t('influenciador.neuralConfidence.subtitle')}</p>
      </div>

      <ul className="space-y-5">
        {data.map((row) => (
          <li key={row.key}>
            <ProgressBar
              label={t(`influenciador.neuralConfidence.${row.key}`)}
              value={row.value}
              showValue
              variant="primary"
              size="md"
            />
          </li>
        ))}
      </ul>
    </Card>
  )
}
