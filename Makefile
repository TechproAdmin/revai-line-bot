PROJECT_ID := revai-456711
REGION := asia-northeast1
REPOSITORY := cloud-run-source-deploy
IMAGE_NAME := realestate-linebot
TAG := latest

# Full image name
FULL_IMAGE_NAME := $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPOSITORY)/$(IMAGE_NAME):$(TAG)

.PHONY: gcp-auth
gcp-auth:
	@echo "🔐 Setting up Docker authentication..."
	gcloud auth configure-docker $(REGION)-docker.pkg.dev

.PHONY: gcp-build-tag
gcp-build-tag:
	@read -p "Enter tag (default: $(TAG)): " tag; \
	tag=$${tag:-$(TAG)}; \
	image_name="$(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPOSITORY)/$(IMAGE_NAME):$$tag"; \
	echo "🔨 Building Docker image with tag: $$tag"; \
	docker build -t $$image_name .

.PHONY: gcp-push-tag
gcp-push-tag:
	@read -p "Enter tag to push (default: $(TAG)): " tag; \
	tag=$${tag:-$(TAG)}; \
	image_name="$(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPOSITORY)/$(IMAGE_NAME):$$tag"; \
	echo "🚀 Pushing image: $$image_name"; \
	docker push $$image_name

# 依存関係をインストール
install:
	npm install

# 開発サーバーを起動
dev:
	npm run dev

# アプリケーションをビルド
build: install
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
	docker compose up -d

# Docker環境を停止
docker-down:
	docker compose down

# Ngrokトンネルを起動
ngrok:
	npx ngrok http 3000
