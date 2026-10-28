FROM node:22-alpine AS build
WORKDIR /app
# untuk mengompilasi bcrypt bila prebuilt binary untuk Alpine (musl) tidak tersedia
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# node-pg-migrate ada di dependencies sehingga tetap tersedia setelah prune untuk migrasi saat container start
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json docker-entrypoint.sh ./
COPY migrations ./migrations
USER node
EXPOSE 3000
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
CMD ["node", "dist/main"]
