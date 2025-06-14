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
	@echo "Current account:"
	@gcloud config get-value account || echo "No account set"
	@echo "Re-authenticating with Google Cloud..."
	gcloud auth login
	@echo "Setting project..."
	gcloud config set project $(PROJECT_ID)
	@echo "Configuring Docker..."
	gcloud auth configure-docker $(REGION)-docker.pkg.dev
	@echo "✅ Authentication setup complete"

.PHONY: gcp-build-tag
gcp-build-tag: format
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
build: install format
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

# フォーマッターを実行
format:
	npx @biomejs/biome check --write src styles

# Docker環境をビルドして起動
docker-up:
	docker compose up -d

# Docker環境を停止
docker-down:
	docker compose down

# Ngrokトンネルを起動
ngrok:
	npx ngrok http 3000

# Cloud Run デプロイ用の共通関数
define deploy-to-cloudrun
	@echo "🌐 Deploying to Cloud Run..."
	gcloud run deploy realestate-linebot \
		--image=$(1) \
		--region=$(REGION) \
		--platform=managed \
		--allow-unauthenticated \
		--port=3000 \
		--memory=1Gi \
		--cpu=1 \
		--max-instances=10 \
		--min-instances=0 \
		--concurrency=80 \
		--timeout=300 \
		--set-env-vars="NODE_ENV=production,APP_ENV=production" \
		--quiet
	@echo "✅ Deployment completed successfully!"
endef

# Cloud Run に直接デプロイ
.PHONY: deploy
deploy: gcp-build-tag gcp-push-tag
	@read -p "Enter tag (default: $(TAG)): " tag; \
	tag=$${tag:-$(TAG)}; \
	image_name="$(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPOSITORY)/$(IMAGE_NAME):$$tag"; \
	$(call deploy-to-cloudrun,$$image_name)

# 最新バージョンでデプロイ
.PHONY: deploy-latest
deploy-latest: gcp-build-tag
	@docker push $(FULL_IMAGE_NAME)
	$(call deploy-to-cloudrun,$(FULL_IMAGE_NAME))

# Cloud Run サービスの状態確認
.PHONY: status
status:
	@echo "📊 Cloud Run service status..."
	gcloud run services list --region=$(REGION)
	@echo ""
	@echo "📈 Service details:"
	gcloud run services describe realestate-linebot --region=$(REGION)
