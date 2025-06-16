FROM oven/bun:1-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile --production

COPY src ./src
COPY tsconfig.json ./

RUN bun build src/index.ts --outdir=dist --target=bun

EXPOSE 8081

ENV PORT=8081
ENV NODE_ENV=production

CMD ["bun", "run", "dist/index.js"]
