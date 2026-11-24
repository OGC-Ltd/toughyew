# Build the stylesheet, the browser script and the server, then run the server with only its
# runtime dependencies.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.client.json ./
COPY src ./src
RUN npm run build

FROM node:22-slim
ENV NODE_ENV=production \
    PORT=3100
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY views ./views
COPY public ./public
COPY --from=build /app/dist ./dist
COPY --from=build /app/public/css ./public/css
COPY --from=build /app/public/js ./public/js
# Visits, enquiries and quotations are saved here; it is a volume so they survive redeploys.
RUN mkdir -p /app/data && chown node:node /app/data
USER node
VOLUME /app/data
EXPOSE 3100
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3100/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "dist/server.js"]
