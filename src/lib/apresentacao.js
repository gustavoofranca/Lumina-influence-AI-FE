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

// O mapa de nós da "Densidade da rede" é um SVG com posições fixas, igual para
// toda agência — o próprio componente se diz decorativo. Ao lado de cartões de
// dado medido, ele passava por grafo calculado. Sem ele o painel também deixa
// de buscar `/network-density`.
export const MOSTRAR_DENSIDADE_DA_REDE_DECORATIVA = false

/* -------------------------------------------------------------------------- */
/* Modo apresentação                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Cortes que valem só na gravação da apresentação do TCC.
 *
 * Diferente das chaves acima, nada disto é defeito: são elementos verdadeiros
 * que, num vídeo que circula fora da banca, expõem dado pessoal (o @ da conta
 * real, a fala transcrita) ou desviam o olhar para operação de rotina (editar,
 * excluir, conectar conta). Ligam com `VITE_MODO_APRESENTACAO=true` no
 * `.env.local` da máquina que grava; sem a variável o site publicado fica
 * exatamente como era. Complementa a máscara de `mascara.js`, que troca nomes
 * nas respostas da API mas não tem como tirar um elemento da tela.
 */

// Só a string exata liga o modo. "1", "yes" ou um erro de digitação deixam o
// site como é: o modo existe para tirar coisas da tela, e ligar por engano no
// site publicado seria pior do que esquecer de ligar na gravação.
export function lerModoApresentacao(valor) {
  return valor === 'true'
}

// O `?.` existe porque os testes rodam no Node, onde `import.meta.env` não
// existe.
export const MODO_APRESENTACAO = lerModoApresentacao(import.meta.env?.VITE_MODO_APRESENTACAO)

// "ID da sessão #…", "ID da análise: #…" e o #id do histórico são chaves do
// banco: não dizem nada a quem assiste e parecem dado técnico vazado.
export const MOSTRAR_IDS_INTERNOS = !MODO_APRESENTACAO

// O @ é o identificador público da pessoa real dona da conta conectada. A
// máscara troca o texto, mas um @ inventado ao lado de métricas reais confunde
// mais do que esclarece; o nome de exibição basta para a demonstração.
export const MOSTRAR_HANDLE = !MODO_APRESENTACAO

// A transcrição é a fala da pessoa, palavra por palavra — o dado mais pessoal
// da tela. As notas que a IA tira dela continuam visíveis.
export const MOSTRAR_TRANSCRICAO = !MODO_APRESENTACAO

// "Contas conectadas" e "Analisar vídeo" são operação (vincular conta, subir
// arquivo), não resultado. Na gravação a aba Visão Geral fica nos números.
export const MOSTRAR_CARTOES_OPERACIONAIS_DO_CRIADOR = !MODO_APRESENTACAO

// % orgânico, % pago e custo no benchmarking: a divisão orgânico × pago não é
// medida na coleta real (sai travessão), e o custo é valor negociado com a
// pessoa. Na gravação ficam criador, alcance, engajamento, sentimento e Score.
export const MOSTRAR_COLUNAS_COMERCIAIS_DO_BENCHMARK = !MODO_APRESENTACAO

// A tabela "Posts auditados" da prévia repete legenda e data de cada post da
// conta real; o resumo e o benchmarking já contam a história do relatório.
export const MOSTRAR_POSTS_AUDITADOS_NA_PREVIA = !MODO_APRESENTACAO

// Editar e Excluir nos cabeçalhos de criador e campanha: são manutenção de
// cadastro e, ao lado da ação principal, disputam o olhar com ela no vídeo.
export const MOSTRAR_EDITAR_E_EXCLUIR = !MODO_APRESENTACAO
