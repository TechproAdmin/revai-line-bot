# ビルドステージ
FROM node:20-slim AS builder
WORKDIR /app

# パッケージ依存関係のみをコピーして、キャッシュレイヤーを活用
COPY package*.json ./
RUN npm ci

# ソースコードをコピー
COPY . .
RUN npm run build

# 実行ステージ
FROM node:20-slim AS runner
WORKDIR /app

# 本番環境向け設定
ENV NODE_ENV=production
EXPOSE 3000

# 必要なファイルのみをコピー
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# セキュリティとパーミッションの設定
RUN chown -R node:node /app
USER node

CMD ["npm", "start"]
