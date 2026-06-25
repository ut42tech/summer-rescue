<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/98287636-a79d-475a-ba3b-194db702cb12

## Run Locally

**Prerequisites:** Node.js 20+ and [pnpm](https://pnpm.io/) 10+

pnpm を入れていない場合は、Node 同梱の Corepack で有効化できます（`package.json` の `packageManager` で版を固定済み）:

```bash
corepack enable
```

1. 依存関係をインストール:
   ```bash
   pnpm install
   ```
2. `.env.local` の `GEMINI_API_KEY` に、ご自身の Gemini API キーを設定します（[Google AI Studio](https://aistudio.google.com/apikey) で取得）。`.env.local` はリポジトリに含まれません。
3. 開発サーバーを起動:
   ```bash
   pnpm dev
   ```
   http://localhost:3000 で開きます。

### その他のコマンド

| コマンド | 説明 |
| --- | --- |
| `pnpm build` | 本番ビルド |
| `pnpm start` | 本番ビルドを起動（事前に `pnpm build`） |
| `pnpm lint` | ESLint を実行 |
