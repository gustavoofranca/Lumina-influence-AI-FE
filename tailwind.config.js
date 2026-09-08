/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // ===== Paleta oficial Lumina Influence AI =====
      colors: {
        primary: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED', // base
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          DEFAULT: '#7C3AED',
        },
        secondary: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9', // base
          600: '#0284C7',
          700: '#0369A1',
          DEFAULT: '#0EA5E9',
        },
        tertiary: {
          50:  '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E', // base
          600: '#E11D48',
          700: '#BE123C',
          DEFAULT: '#F43F5E',
        },
        neutral: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A', // base do app
          950: '#020617',
        },
        // Tokens semânticos — apontam para as variáveis de index.css, que são
        // redefinidas em :root[data-theme="light"]. Hex fixo aqui prenderia a
        // classe a um tema só.
        bg: {
          base:     'rgb(var(--bg-base-rgb) / <alpha-value>)',
          surface:  'rgb(var(--bg-surface-rgb) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated-rgb) / <alpha-value>)',
          input:    'var(--bg-input)',
        },
        text: {
          primary:   'rgb(var(--text-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
          muted:     'rgb(var(--text-muted-rgb) / <alpha-value>)',
          label:     'var(--text-label)',
        },
        // Texto colorido que precisa trocar de tom entre os temas.
        accent: {
          DEFAULT: 'var(--accent)',
          strong:  'var(--accent-strong)',
          soft:    'var(--accent-soft)',
        },
        positive: 'var(--positive)',
        caution:  'var(--caution)',
        // Azul e coral usados como texto sobre a superfície do tema.
        tint: {
          sky:  'var(--tint-sky)',
          rose: 'var(--tint-rose)',
        },
        // Trilho de barra e divisória: trocam de lado junto com o tema.
        track:    'var(--track)',
        hairline: 'rgb(var(--hairline-rgb) / <alpha-value>)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger:  'var(--danger)',
        info:    'var(--info)',
        // ===== Paleta da landing =====
        // A página pública é sempre escura e segue o arquivo de design, cuja
        // paleta é próxima da do app mas não igual (fundo mais azulado, violeta
        // mais claro). Fica em escopo próprio de propósito: mexer nos tokens do
        // app arrastaria junto o tema claro e as medições de contraste das 22
        // rotas internas.
        landing: {
          bg:       '#08021A',
          surface:  '#0E0524',
          card:     '#0F1930',
          elevated: '#1F2B49',
          glass:    '#1B1033',
          text:     '#DEE5FF',
          muted:    '#A3AAC4',
          violet:   '#BD9DFF',
          blue:     '#34B5FA',
          danger:   '#FF6F7E',
          ink:      '#2E006C',
          line:     '#40485D',
          // ===== Os dois papéis que carregam a tese =====
          // Cor cheia é privilégio do que foi medido. O que o sistema não sabe
          // aparece em contorno, nunca preenchido — é a ADR-003 virando
          // linguagem visual na página pública.
          measured:   '#BD9DFF',
          unmeasured: '#5A6480',
        },
      },
      fontFamily: {
        // Bricolage Grotesque no display: variável, levemente condensada, com
        // desenho próprio em corpo grande. Plus Jakarta Sans + Inter é o par
        // mais usado de SaaS — é o que fazia a página parecer template.
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'sans-serif'],
        sans:    ['Inter', 'sans-serif'],
        // Só a marca. Baloo 2 é pesada, de terminais arredondados e contador
        // fechado — o desenho que o Gustavo pediu como referência. Fica numa
        // família própria de propósito: se ela vazar para texto corrido, a
        // página inteira muda de tom.
        marca:   ['"Baloo 2"', '"Bricolage Grotesque"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        /*
         * Escala de raio com trabalho definido, em vez de seis degraus por
         * hábito. Medido antes: `rounded-xl` 70 vezes, `2xl` 59, `full` 58,
         * `lg` 24, `md` 20, `3xl` 5, mais sete valores avulsos — nenhuma
         * regra dizia qual usar onde.
         *
         * Três degraus, e o nome diz o papel:
         *   controle  — o que se clica: botão, campo, chip, item de menu
         *   superficie — o que contém: cartão, painel, popover
         *   janela    — o que se sobrepõe à tela inteira: modal, gaveta
         *
         * Pílula continua sendo `rounded-full`: é forma, não degrau.
         */
        controle:   '10px',
        superficie: '14px',
        janela:     '20px',
      },
      boxShadow: {
        // Elevação de verdade, ligada à variável do tema: no escuro quase não
        // aparece e quem separa as camadas é a superfície mais clara; no claro
        // ela carrega o peso. Uma escala só, com três alturas.
        1: 'var(--sombra-1)',
        2: 'var(--sombra-2)',
        3: 'var(--sombra-3)',
        // Brilho roxo dos cartões da landing: um halo externo largo e difuso
        // mais um realce interno na borda superior, que dá a impressão de luz
        // vinda de cima em vez de sombra colorida colada atrás.
        'glow-card':  '0 0 60px -18px rgba(124,58,237,0.55), inset 0 1px 0 0 rgba(189,157,255,0.14)',
        'glow-card-forte': '0 0 80px -16px rgba(124,58,237,0.75), inset 0 1px 0 0 rgba(189,157,255,0.22)',
        'glow-primary': '0 0 24px rgba(124, 58, 237, 0.4)',
        'glow-soft':    '0 0 16px rgba(124, 58, 237, 0.2)',
        'glow-secondary': '0 0 24px rgba(14, 165, 233, 0.35)',
        'glow-tertiary':  '0 0 24px rgba(244, 63, 94, 0.35)',
      },
      backgroundImage: {
        // Divisor que some nas duas pontas — assinatura do arquivo de
        // referência, e o que impede a régua de bater na borda da seção.
        'hairline-fade':
          'linear-gradient(270deg, rgba(61,53,78,0) 28.87%, rgb(61,53,78) 45.39%, rgb(61,53,78) 53.54%, rgba(61,53,78,0) 70.06%)',
        // Moldura de 1px: o pai recebe este gradiente, o filho recuado 1px
        // recebe o fundo sólido. É como a referência desenha borda com
        // degradê, que `border-image` não faz junto com `border-radius`.
        'moldura-cartao':
          'linear-gradient(180deg, rgba(169,163,194,0.05) 0%, rgba(169,163,194,0.20) 100%)',
        // Lavado radial de seção, medido no arquivo: elipse enorme, opacidade
        // baixíssima, saindo do topo. É o que tira o chapado do fundo sem que
        // se perceba um gradiente.
        'wash-secao':
          'radial-gradient(150% 55% at 50% 0%, rgba(133,102,255,0.08) 0%, rgba(133,102,255,0) 100%)',
        'wash-secao-suave':
          'radial-gradient(180% 60% at 50% 0%, rgba(133,102,255,0.04) 0%, rgba(133,102,255,0) 100%)',
        'gradient-brand': 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)',
        'gradient-danger': 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
      },
      keyframes: {
        // Deriva das auras do fundo da landing. Percurso longo e lento: a
        // intenção é dar profundidade, não chamar atenção.
        'aura-lenta': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%':      { transform: 'translate3d(6vw, 4vh, 0) scale(1.12)' },
        },
        'aura-lenta-2': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1.08)' },
          '50%':      { transform: 'translate3d(-5vw, 6vh, 0) scale(1)' },
        },
        // Volta completa do gradiente cônico que forma a borda viva.
        'girar-brilho': {
          '0%':   { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        // Desfile contínuo: a trilha anda metade da própria largura, e a
        // segunda metade é cópia da primeira — no instante do salto o que
        // está na tela é idêntico, então a emenda não aparece.
        desfilar: {
          '0%':   { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(1.15)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'aura-lenta':   'aura-lenta 34s ease-in-out infinite',
        'aura-lenta-2': 'aura-lenta-2 46s ease-in-out infinite',
        'girar-brilho': 'girar-brilho 4s linear infinite',
        desfilar: 'desfilar 32s linear infinite',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
        'fade-in':   'fade-in 0.3s ease-out',
        'shimmer':   'shimmer 1.4s linear infinite',
      },
      letterSpacing: {
        'label': '0.08em',
        'display-tight': '-0.02em',
      },
    },
  },
  plugins: [],
}
