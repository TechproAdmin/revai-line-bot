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
├── client/                      # フロントエンド（クライアントサイド）
│   └── features/                # 機能別モジュール
│       ├── form/                # フォーム機能
│       │   ├── components/      # フォーム関連コンポーネント
│       │   │   ├── ReportForm.tsx     # メインフォーム
│       │   │   ├── FormField.tsx      # 汎用フィールド
│       │   │   ├── NumberInput.tsx    # 数値入力
│       │   │   ├── SelectInput.tsx    # 選択入力
│       │   │   └── TextInput.tsx      # テキスト入力
│       │   ├── hooks/           # カスタムフック
│       │   │   ├── useFormData.ts     # フォーム状態管理
│       │   │   └── useFormCalculation.ts # 自動計算ロジック
│       │   └── utils/           # フォーム用ユーティリティ
│       │       └── formUtils.ts       # データ変換関数
│       ├── report/              # レポート機能
│       │   ├── components/      # レポート関連コンポーネント
│       │   │   ├── Report.tsx         # メインレポート
│       │   │   ├── AnalysisResultsTable.tsx # 分析結果テーブル
│       │   │   ├── CashFlowChart.tsx  # キャッシュフローチャート
│       │   │   ├── DeadCrossChart.tsx # デッドクロスチャート
│       │   │   └── LoanChart.tsx      # ローンチャート
│       │   └── utils/           # レポート用ユーティリティ
│       │       ├── formatters.ts      # 数値・日付フォーマット
│       │       └── pdfGenerator.ts    # PDF生成ロジック
│       └── upload/              # アップロード機能
│           └── components/      # アップロード関連コンポーネント
│               └── PdfUploader.tsx    # PDF処理コンポーネント
├── server/                      # バックエンド（サーバーサイド）
│   ├── infrastructure/          # インフラ層（API連携）
│   │   ├── api.ts               # 統合API（本番・モック両方）
│   │   └── config/              # 設定ファイル
│   │       └── api.ts           # API設定・プロンプト
│   └── utils/                   # サーバー用ユーティリティ
│       └── logger.ts            # ログ出力
├── shared/                      # 共通モジュール
│   ├── constants/               # 定数定義
│   │   └── formFields.ts        # フォームフィールド設定
│   └── types/                   # TypeScript型定義
│       ├── api.ts               # API関連型
│       └── form.ts              # フォーム関連型
├── pages/                       # Next.js ページ
│   ├── api/                     # API Routes（Next.js APIエンドポイント）
│   │   ├── report.ts            # レポート生成エンドポイント
│   │   └── upload.ts            # アップロードエンドポイント
│   └── index.tsx                # メインページ
└── styles/                      # スタイル
    └── globals.css              # グローバルCSS
```

### 🏗️ アーキテクチャ設計

- **機能別モジュール**: 各機能（form, report, upload）を独立したモジュールとして分離
- **レイヤー分離**: client（フロントエンド）とserver（バックエンド）の明確な分離
- **コンポーネント分割**: 大きなコンポーネントを小さく再利用可能な部品に分割
- **カスタムフック**: 状態管理とビジネスロジックの分離
- **バレルエクスポート**: index.tsファイルによるクリーンなインポート
- **型安全性**: 共通型定義による一貫した型チェック
- **環境別実装**: 
  - **開発環境**: infrastructure/api.ts のモック関数を使用
  - **本番環境**: infrastructure/api.ts の実際のAPI連携を使用

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
