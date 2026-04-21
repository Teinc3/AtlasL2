FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
COPY shared/package.json shared/

RUN npm ci

COPY tsconfig.json .
COPY client/tsconfig.app.json client/tsconfig.node.json client/vite.config.ts client/
COPY server/tsconfig.server.json server/
COPY shared/tsconfig.shared.json shared/
COPY scripts/build-server.mjs scripts/tsconfig.scripts.json ./scripts/

COPY client/src client/src
COPY client/index.html client/index.html
COPY client/public client/public
COPY server/src server/src
COPY shared/src shared/src

# For the vite base path
COPY .env ./.env

RUN npm run build

# Create logs directory to ensure it exists for the volume mount
RUN mkdir -p logs

EXPOSE 3713

CMD ["npm", "run", "start"]
