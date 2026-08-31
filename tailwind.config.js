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
          bg:       '#060E20',
          surface:  '#091328',
          card:     '#0F1930',
          elevated: '#1F2B49',
          glass:    '#192540',
          text:     '#DEE5FF',
          muted:    '#A3AAC4',
          violet:   '#BD9DFF',
          blue:     '#34B5FA',
          danger:   '#FF6F7E',
          ink:      '#2E006C',
          line:     '#40485D',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'glow-primary': '0 0 24px rgba(124, 58, 237, 0.4)',
        'glow-soft':    '0 0 16px rgba(124, 58, 237, 0.2)',
        'glow-secondary': '0 0 24px rgba(14, 165, 233, 0.35)',
        'glow-tertiary':  '0 0 24px rgba(244, 63, 94, 0.35)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)',
        'gradient-danger': 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
      },
      keyframes: {
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
