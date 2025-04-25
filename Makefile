# 依存関係をインストール
install:
	npm install

# 開発サーバーを起動
dev:
	npm run dev

# アプリケーションをビルド
build:
	npm run build

# ビルド済みアプリを起動
start:
	npm run start

# テストを実行
test:
	npm run test

# リントを実行
lint:
	npm run lint

# Docker環境をビルドして起動
docker-up:
	docker-compose up -d

# Docker環境を停止
docker-down:
	docker-compose down

# Ngrokトンネルを起動
ngrok:
	npx ngrok http 3000