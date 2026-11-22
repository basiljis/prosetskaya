# App: TanStack Start SSR built for a plain Node server (nitro node-server preset).
FROM node:22-alpine AS build
WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm i -g bun@1
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install
COPY . .
# Vite bakes VITE_* in at build time: the browser talks only to api.prosetskaya.ru.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
    NITRO_PRESET=node-server
RUN bun run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
COPY --from=build /app/.output ./.output
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:3000/robots.txt >/dev/null || exit 1
CMD ["node", ".output/server/index.mjs"]
