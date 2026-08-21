# Imagem de desenvolvimento do front-end Lumina (Vite dev server).
# Não use em produção: para deploy, sirva o resultado de `npm run build`.
FROM node:22-alpine

# A imagem node já traz o usuário `node` com UID/GID 1000, iguais aos do host.
WORKDIR /app
RUN chown node:node /app
USER node

# Instalar como `node` (e não como root) é o que garante que o node_modules —
# e o volume anônimo que o compose cria a partir dele — fique gravável pelo
# processo do Vite, que precisa escrever o cache em node_modules/.vite.
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

COPY --chown=node:node . .

EXPOSE 5173

# --host 0.0.0.0 é obrigatório: por padrão o Vite escuta só em localhost,
# que dentro do container não é alcançável a partir da máquina.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
