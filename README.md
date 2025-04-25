# REV.AI LINE ボット

## 技術スタック
- Next.js
- React
- TypeScript
- Docker
- ESLint
- PostCSS
- LINE Front-end Framework (LIFF)
- OpenAI API
- Ngrok

## 前提条件
- Node.js (推奨バージョン: 20.x以上)
- npm または yarn
- Docker および Docker Compose (コンテナ化して実行する場合)

## インストール方法

### 開発環境（ローカル）

1. リポジトリをクローンします：
```bash
git clone <リポジトリURL>
cd <プロジェクトディレクトリ>
```

2. 依存パッケージをインストールします：
```bash
make install
```

3. 環境変数を設定します：
```bash
cp .env.local.example .env.local
# .env.local ファイルを適切に編集してください
```

### 環境変数の設定
`.env.local`ファイルには以下の環境変数を設定する必要があります：

- `NEXT_PUBLIC_LIFF_ID`: LINE Front-end Framework (LIFF) のIDを設定します。LINE Developersコンソールで取得できます。
- `NEXT_PUBLIC_OPENAI_API_KEY`: OpenAI APIを使用するためのAPIキーを設定します。OpenAIのウェブサイトから取得できます。
- `NGROK_AUTHTOKEN`: Ngrokのトンネリングサービスを使用するための認証トークンを設定します。ローカル開発環境を公開するために使用します。

### Ngrok認証トークンの取得方法

1. [Ngrokの公式サイト](https://ngrok.com)にアクセスし、無料アカウントを作成します。
2. アカウント作成後、ダッシュボードにログインします。
3. ダッシュボードの「Getting Started」または「Setup & Installation」セクションに認証トークン（Authtoken）が表示されています。
4. この認証トークンをコピーして以下のコマンドを実行し、Ngrokの設定ファイルに保存します：
   ```bash
   ngrok config add-authtoken あなたの認証トークン
   ```
5. または、直接`.env.local`ファイルに`NGROK_AUTHTOKEN=あなたの認証トークン`として保存します。

認証トークンは一度だけ表示され、セキュリティ上の理由から再表示されないため、必ず安全な場所に保管してください。

### Docker を使用する場合

1. Dockerイメージをビルドして起動します：
```bash
make docker-up
```

## 使用方法（Docker環境）

0. **初回のみ**: [https://account.line.biz/profile](https://account.line.biz/profile) にアクセスして、LINEビジネスアカウントと自身のLINEアカウントを紐づけておきます。

0. LINE Developerから**収益性分析App**にアクセスして、先ほどのビジネスアカウントに権限を付与させておきます。

1. [http://localhost:4040/inspect/http](http://localhost:4040/inspect/http) にアクセスして、HTTPSのURLを取得します。

2. LINE DeveloperのLIFFアプリ詳細のエンドポイントURLに、取得したURLを保存します。

3. 取得したURLまたは[http://localhost:3000](http://localhost:3000)にアクセスすると、アプリが起動します。

## ディレクトリ構造
- `/src` - アプリケーションのソースコード
- `/public` - 静的ファイル
- `/styles` - CSSやスタイル関連ファイル
- `/.next` - Next.jsのビルド出力（自動生成）
- `/node_modules` - 依存パッケージ（自動生成）

## トラブルシューティング

- Ngrokの接続でエラーが発生する場合は、認証トークンが正しく設定されているか確認してください。
- LIFFの初期化に問題がある場合は、LIFF IDが正しく設定されているか確認してください。
- アプリケーションが正常に動作しない場合は、コンソールログを確認して問題を特定してください。
