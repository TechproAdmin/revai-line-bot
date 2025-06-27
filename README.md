# 🏠 不動産投資分析 LINE Bot

Next.jsベースの不動産投資分析アプリケーション。PDF文書をアップロード・OCR処理し、AI による包括的な不動産投資分析レポートを生成します。

## ✨ 機能

- 📄 **PDF文書アップロード**: 物件資料の自動読み取り
- 🤖 **AI分析**: OpenAI API による不動産データ抽出
- 📊 **投資分析**: 利回り・キャッシュフロー・リスク評価
- 📱 **LINE連携**: LIFF Framework による簡単アクセス
- ☁️ **クラウド対応**: Google Cloud Run でのスケーラブルな運用

## 🚀 技術スタック

| カテゴリ | 技術 | 
|----------|------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS 4 |
| **APIs** | LINE LIFF, OpenAI API |
| **Infrastructure** | Docker, Google Cloud Run |
| **Development** | Biome (Lint/Format), Ngrok |

## 📋 前提条件

- **Node.js** 20.x以上
- **Docker & Docker Compose** 
- **Google Cloud SDK** (デプロイ時)

## ⚡ クイックスタート

### 1️⃣ セットアップ

```bash
# リポジトリをクローン
git clone <リポジトリURL>
cd revai-line-bot

# 依存関係をインストール
make install

# 環境変数を設定
cp .env.local.example .env.local
# .env.local を編集
```

### 2️⃣ 環境変数

`.env.local` ファイルに以下を設定：

```env
NEXT_PUBLIC_LIFF_ID=your_liff_id
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NGROK_AUTHTOKEN=your_ngrok_token
NODE_ENV=development  # production で本番API使用
```

### 3️⃣ 開発サーバー起動

```bash
# ローカル開発
make dev

# Docker環境
make docker-up
```

## 📁 プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── ReportForm.tsx   # メインフォーム（自動計算機能付き）
│   ├── PdfUploader.tsx  # PDF処理コンポーネント
│   ├── Report.tsx       # レポート表示
│   └── types.ts         # TypeScript型定義
├── pages/
│   ├── api/
│   │   ├── report.ts    # レポート生成API
│   │   └── upload.ts    # PDFアップロード処理
│   └── index.tsx        # メインページ
└── utils/
    └── api.ts           # API統合ロジック
```

## 🎯 主要機能詳細

### 自動計算フィールド
- **購入諸費用**: 物件価格の8%
- **自己資金**: 物件価格の10% + 購入諸費用  
- **借入金額**: 物件価格の90%
- **年間運営経費**: 物件価格 × 表面利回り * 0.07
- **売却諸費用**: 想定売却価格の4%

### API連携
- **開発環境**: モックデータで高速開発
- **本番環境**: 外部不動産評価API連携

## 🔧 開発コマンド

```bash
# 基本操作
make install         # 依存関係インストール
make dev            # 開発サーバー起動
make build          # プロダクションビルド
make lint           # コード品質チェック

# Docker環境
make docker-up      # コンテナ起動
make docker-down    # コンテナ停止

# GCPデプロイ
make deploy-latest  # 最新版をデプロイ
make deploy         # カスタムタグでデプロイ
make status         # サービス状態確認
```

## ☁️ デプロイ手順

### Google Cloud Run 自動デプロイ

1. **本番環境変数の設定**
   ```bash
   # .env.production ファイルを作成・編集
   cp .env .env.production
   # 本番用の値に変更
   ```

   `.env.production` ファイルの例：
   ```env
   NEXT_PUBLIC_LIFF_ID=本番用_liff_id
   NEXT_PUBLIC_OPENAI_API_KEY=本番用_openai_api_key
   ```

2. **APIを有効化 （初回のみ）**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

3. **ワンコマンドデプロイ**
   ```bash
   make deploy-latest
   ```

4. **デプロイ確認**
   ```bash
   make status
   ```

### 本番環境設定
- **メモリ**: 1GB
- **CPU**: 1コア  
- **自動スケーリング**: 0-10インスタンス
- **同時リクエスト**: 80
- **タイムアウト**: 300秒

## 🔧 LINE LIFF 設定

### 開発環境
1. Ngrok で HTTPS トンネル作成
2. LINE Developers でエンドポイント URL を設定
3. LIFF ID を環境変数に設定

### 本番環境  
1. Cloud Run の URL を LINE Developers に設定
2. 本番用 LIFF ID を環境変数に設定

## 🐛 トラブルシューティング

| 問題 | 解決方法 |
|------|---------|
| Ngrok接続エラー | 認証トークンを再確認 |
| LIFF初期化失敗 | LIFF IDが正しく設定されているか確認 |
| API呼び出しエラー | 環境変数とAPIキーを確認 |
| ビルドエラー | `make lint` でコード品質をチェック |

## 🤝 コントリビューション

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request
