/**
 * O que a interface esconde enquanto não funciona de verdade.
 *
 * Tudo aqui é recurso que aparecia na tela sem nada por trás: botão que leva a
 * uma cobrança que não existe, selo "ao vivo" com o agendador desligado,
 * cartão que simulava uma análise quadro a quadro. Num trabalho sobre não
 * apresentar como medido o que não foi medido, a interface não pode fazer isso
 * consigo mesma.
 *
 * Nada foi apagado. Cada chave em `true` devolve o elemento como estava, e é o
 * que fazer quando a funcionalidade por trás passar a existir.
 */

// Leva a "Configurações → Plano", onde troca de plano e cobrança ainda não
// estão disponíveis — o próprio texto da tela admite isso.
export const MOSTRAR_BOTAO_UPGRADE = false

// O painel dizia "sincronização ao vivo", mas o agendador está desligado por
// padrão (LUMINA_DISABLE_SCHEDULER) e a coleta só acontece quando alguém pede.
export const MOSTRAR_SELO_AO_VIVO = false

// ROI e CAC dependem de cachê e retorno declarados na campanha. Sem eles o
// indicador aparece como travessão — correto, mas é metade da faixa do painel
// ocupada por ausência. Com valor medido, eles aparecem normalmente.
export const MOSTRAR_KPI_FINANCEIRO_SEM_MEDICAO = false

// A série temporal de sentimento nunca é enviada pela API; o espaço mostrava
// só "ainda não disponível". Os grupos e as palavras-chave, que são reais,
// continuam no cartão.
export const MOSTRAR_SERIE_TEMPORAL_DE_SENTIMENTO = false

// Miniatura decorativa de Reel com selo de "IA escaneando" e duração fixa:
// sugeria uma análise quadro a quadro que não acontece. A análise real de
// vídeo aparece na transcrição, logo abaixo.
export const MOSTRAR_AUDITORIA_DE_VIDEO_DECORATIVA = false

// Coerência, sentimento e bot ao lado da trajetória, repetindo o que a aba
// Diagnóstico IA já mostra — a duplicação levantava dúvida sobre a fonte.
export const MOSTRAR_INTEGRIDADE_RESUMIDA = false

// "Pessoas verificadas" e "contas suspeitas" aplicam a probabilidade de bot de
// poucos comentários analisados a todos os seguidores: com 6 comentários, o
// card afirmava 8 mil pessoas verificadas. Volta quando a amostra justificar.
export const MOSTRAR_INTEGRIDADE_DO_PUBLICO = false
