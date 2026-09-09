# Repaginação da área autenticada — plano de execução

**Aberto em:** 09/09/2026 · **Alvo:** entrega entre 11 e 17/09/2026
**Protótipo aprovado:** https://claude.ai/code/artifact/b88ffbcd-030a-47fa-883e-807444e63eb0

Este documento existe para sobreviver a limpeza de contexto. Quem retomar o
trabalho lê daqui, não da conversa. **Mantenha a seção "Estado" atualizada a
cada etapa concluída.**

---

## 1. O que se quer

Levar a área autenticada para a linguagem visual da landing, com material de
vidro na navegação e no cartão, mantendo o dado sobre fundo quieto.

A referência que originou o pedido é um painel de DeFi com vidro sobre degradê
saturado. O que se toma dela: **fundo com profundidade**, **vidro no cartão**,
**grade densa**. O que não se toma: a saturação, e vidro por baixo de número.

Critério do dono, na ordem dele: *"precisa ser acima de tudo um ambiente bom de
trabalhar, e depois bonito, que converse com a landing page"*.

## 2. Diagnóstico medido — 09/09, viewport 1440×1000

O painel real tem **347px de vazio em 1556px de altura útil: 22% da página**.

| Linha | Esquerda | Direita | Vazio |
|---|---:|---:|---:|
| 1 | gráfico de crescimento, 432px | diagnóstico em destaque, 582px | **150px sob o gráfico** |
| 2 | tabela de criadores, 603px | densidade da rede, 406px | **197px sob a densidade** |

Os dois desequilíbrios são **opostos** — numa linha sobra à esquerda, na outra à
direita. É o sintoma clássico de grade em linhas independentes: cada linha se
alinha pela coluna mais alta, e a mais baixa deixa buraco.

Outros vazios, medidos ou vistos na captura `painel-real.png`:

- **KPIs a 157px de altura para um número só**, com ícone decorativo no canto.
  Dois dos quatro exibem `—`: ROI e CAC não têm valor no período.
- **O gráfico desperdiça a própria caixa**: eixo até 1,2M com dado que chega a
  ~900k, e apenas três rótulos no eixo do tempo (`S1`, `S2`, `S3`) para 30 dias.
- **Zona morta na barra lateral**: ~400px entre o último item de navegação e o
  botão de nova campanha.

## 3. Decisões de design

### 3.1 Paleta — a da landing, não uma aproximação

Os tokens de `landing.*` em `tailwind.config.js` passam a valer na área
autenticada. Os cinza-azulados (`neutral-800/900`) saem.

| Papel | Escuro | Claro |
|---|---|---|
| Fundo | `#08021A` + 3 auroras | `#F7F6FC`, sem aurora |
| Casca (navegação) | `rgba(27,16,51,.66)`, desfoque 16px | `#FFFFFF`, desfoque 0 |
| Vidro (cartão) | `rgba(15,25,48,.52)`, desfoque 16px | `#FFFFFF` sólido |
| Poço (onde mora número) | `#0B1226` chapado | `#F2F0FA` |
| Texto | `#DEE5FF` / `#A3AAC4` / `#5A6480` | `#160B33` / `#4B4468` / `#7A7396` |

**No claro nada é vidro.** Translucidez sobre fundo claro clareia o que passa
atrás e derruba o contraste do texto de navegação — é a regra que o comentário
do `.casca` já registra. A troca mora nas variáveis, não em seletor duplicado.

### 3.2 Duas cores, não quatro famílias

O painel usa hoje verde, âmbar, ciano e rosa para dizer qualidade. Sai tudo. Fica
o par que a landing já definiu:

```
landing.measured   = #BD9DFF   cor cheia é privilégio do que foi medido
landing.unmeasured = #5A6480   o que o sistema não sabe aparece apagado
```

`#FF6F7E` fica reservado para **risco**, e só. `#34B5FA` fica reservado para a
segunda série do gráfico, e só.

Onde a cor codificava três níveis (potencial viral), o código passa a ser
**forma**: três pontos que acendem. Estado em forma, não em matiz — quem não
distingue cor continua lendo.

### 3.3 Vidro na moldura, chapado no dado

O `Card` vira vidro. Dentro dele, todo bloco que carrega número — área de
gráfico, corpo de tabela, barra de coerência — fica num **poço** chapado.

É a divisão que o `Card.jsx` já documenta: *"a lateral do Finder é translúcida,
a lista de arquivos não"*. A referência põe vidro sob a tabela; nós paramos na
moldura.

### 3.4 Grade contínua

As duas linhas independentes viram **duas colunas contínuas**: à esquerda
gráfico e tabela, à direita destaque e densidade. Cada coluna flui na sua
altura, e o vazio de 347px desaparece porque nada precisa se alinhar com nada.

Espaçamento externo cai de 32px para 16px; o interno do cartão fica em 18px.

---

## 4. Etapas

Cada uma fecha sozinha e é commitável. **Pare onde o tempo acabar** — nenhuma
etapa depende de uma posterior.

### Etapa 1 · Fundo e tokens
**Arquivos:** `src/index.css`, `tailwind.config.js`, `src/layouts/AppLayout.jsx`
Levar a paleta da landing para os tokens da área autenticada; trocar o fundo
sólido do `AppLayout` pelas três auroras; ajustar as variáveis do tema claro.
**Pronto quando:** a lateral e o topo, que já usam `.casca`, passam a ler como
vidro; o tema claro não tem aurora nem desfoque.

### Etapa 2 · Materiais no `Card`
**Arquivos:** `src/components/ui/Card.jsx`, `src/index.css`
`.superficie` passa a ser vidro; nasce `.poco` para o miolo chapado. Atualizar
o comentário do `Card.jsx`, que hoje afirma que o cartão é chapado sempre.
**Pronto quando:** todas as telas herdam o material novo sem edição própria.

### Etapa 3 · Grade do painel e KPIs
**Arquivos:** `src/pages/Dashboard.jsx`, `src/components/dashboard/KpiGrid.jsx`
Duas colunas contínuas no lugar de duas linhas; KPI vira faixa compacta, sem
ícone decorativo, com o valor em `landing.measured` e o não medido em
`landing.unmeasured`.
**Pronto quando:** o vazio medido cai de 347px para menos de 60px. **Meça de
novo com o script da seção 6 — não confie no olho.**

### Etapa 4 · Componentes do painel
**Arquivos:** `src/components/dashboard/*.jsx`
Poço no gráfico e na tabela; potencial viral vira três pontos; escala do
gráfico passa a terminar no maior valor real e não em 1,2M fixo; eixo do tempo
ganha rótulos de data em vez de `S1/S2/S3`.
**Pronto quando:** nenhum verde, âmbar ou ciano resta em `dashboard/*`.

### Etapa 5 · Demais telas
**Arquivos:** `influenciador/*`, `campanha/*`, `configuracoes/*`, `relatorio/*`
Mesma troca de material e cor. **Só depois da defesa** — são ~114 pontos de raio
ad-hoc e ~62 de superfície direta.

---

## 5. Riscos conhecidos

**Desempenho.** Cada camada com `backdrop-filter` é uma camada de composição que
o navegador refaz quando o gráfico redesenha. Foi disso que veio a lentidão no
Opera em 08/09. **Medir com trace depois da Etapa 2**, antes de espalhar. Se
custar, a saída é vidro só na primeira dobra.

**Contraste.** O teste automatizado cobre 15 rotas nos dois temas e reprova se o
vidro comer contraste. Ele é a rede, não um obstáculo: se reprovar, o desenho
está errado, não o teste.

**Tema claro sem personalidade.** O violeta profundo não tem tradução direta
para o claro. Se depois da Etapa 1 o claro parecer genérico, é decisão do dono:
tratamento próprio ou modo funcional.

**A captura do TCC.** As 18 figuras em `BE/docs/capturas/` mostram o estado
antigo. Regenerar com `CAPTURAS=1 npx playwright test capturas.spec.js` a partir
de `e2e/`. As legendas em `capturas/README.md` descrevem o que cada figura
prova — reler depois de regenerar.

---

## 6. Verificação — roda a cada etapa

```bash
# da raiz do front
docker --context default exec lumina-frontend sh -lc 'cd /app && npm run build'

# suíte inteira, a partir de e2e/
npm test

# contraste nos dois temas, tela em branco, largura a 390px
#   os scripts de medição vivem no diretório de rascunho da sessão;
#   se sumirem, estão descritos em BE/docs/testes/verificacao-pre-entrega.md
```

**Medir o vazio de novo** depois da Etapa 3: percorrer `main section.grid` e
comparar a altura da seção com a do filho mais alto de cada coluna. O valor de
partida é 347px.

Armadilhas já pagas, registradas para não se repetirem:

- Espere por **condição**, nunca por tempo fixo: a tela de detalhe tem `<main>`
  no DOM e zero caractere aos 2,5s.
- O tema mora em `data-theme` no `<html>`, **não** numa classe `dark`.
  `classList.contains('dark')` passa sempre e não verifica nada.
- Servir o build noutra origem quebra o CORS e derruba tudo para `/login`; o
  sintoma não menciona CORS.

---

## 7. Estado

- [ ] Etapa 1 · Fundo e tokens
- [ ] Etapa 2 · Materiais no `Card`
- [ ] Etapa 3 · Grade do painel e KPIs
- [ ] Etapa 4 · Componentes do painel
- [ ] Etapa 5 · Demais telas — adiada para depois da defesa

**Pendências fora deste plano que continuam abertas:** 16 commits locais não
empurrados (1 no front, 15 no back-end) e o CI vermelho até subirem; 11 erros de
lint do tipo `set-state-in-effect`; Onda 4 da auditoria (ARQ-01 e funções
grandes).
