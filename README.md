<div align="center">

# 🌞 SUMMER RESCUE

**夏休みのダラダラ防止エージェント**

ぽっかり空いた時間を、AI が「いますぐ動ける 1 つのアクション」に変えてくれる Web アプリ。
プランはワンタップで Google カレンダーに登録できます。

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![Gemini](https://img.shields.io/badge/Google-Gemini-8e75ff?logo=googlegemini)
![Firebase](https://img.shields.io/badge/Firebase-Auth-ffca28?logo=firebase)

</div>

<img width="1006" height="586" alt="Image" src="https://github.com/user-attachments/assets/1a2cd0c0-7ec9-4141-89f5-28fc47e6c43c" />

<img width="906" height="903" alt="Image" src="https://github.com/user-attachments/assets/dc4917c0-fd69-49b2-b2ee-11063a847938" />

---

## 💡 コンセプト

「夏休み、気づいたら一日中ダラダラしてた…」をなくすためのツールです。

やる気が出ないときほど、人は「何をするか」を決めるところでつまずきます。SUMMER RESCUE は、
**予算・移動・気分の 3 つを選ぶだけ**で、AI が重い腰を上げたくなるような具体的なプランを 1 つ提案。
さらに **想定所要時間つきでカレンダーに登録**することで、「考える → 決める → 動く」の摩擦を限界まで減らします。

最後にはちょっとしたご褒美（終了後は「一番高いアイス」を解禁 🍦）まで用意して、行動を後押しします。

## ✨ 主な機能

- 🔐 **Google ログイン** — Firebase Authentication によるワンクリック認証
- 🎛️ **条件をタップで選択** — 予算（無料 / 1000円以内 / 贅沢）・移動（自宅 / 近所 / 遠出）・気分（アクティブ / 集中 / リラックス）
- 🤖 **AI プラン生成** — Google Gemini が条件に合わせた行動プランを構造化 JSON で提案（プラン名・想定時間・タグ・具体的アクション・激励メッセージ）
- 📅 **ワンタップでカレンダー登録** — Google Calendar API で「15 分後スタート・想定時間ぶん」の予定を自動作成
- 🔄 **別案の再生成** — 気に入らなければその場で別のプランへ
- 🎨 **ネオブルータリズム UI** — 太い黒枠とハードシャドウ、夏らしいアンバー基調のベントグリッドレイアウト

## 🧭 使い方（ユーザー視点の流れ）

1. **Google でログイン**（カレンダー登録のため `calendar.events` の権限を許可）
2. 左パネルで **予算・移動・気分** を選ぶ
3. **「プランを生成する 🚀」** を押すと、AI がおすすめプランを 1 つ提案
4. 内容を確認し、よければ **「カレンダーに登録 ✅」**／いまいちなら **「別の案を見る 🔄」**
5. 予定の時間になったら動く 👉 終わったらご褒美を解禁 🍦

## 🏗️ アーキテクチャ

```
ブラウザ (React / Next.js App Router, "use client")
  │
  ├─ Firebase Authentication ──▶ Google サインイン（calendar.events スコープ付き）
  │
  ├─ POST /api/chat ───────────▶ Route Handler（サーバー側）
  │                                 └─ @google/genai → Gemini で構造化プランを生成
  │
  └─ Google Calendar REST API ─▶ OAuth アクセストークンで予定を作成
```

- AI 呼び出しは **サーバー側の Route Handler（`app/api/chat/route.ts`）** に閉じており、`GEMINI_API_KEY` がクライアントへ漏れません。
- Gemini は `responseSchema` による **構造化出力** を使い、UI が扱いやすい固定スキーマの JSON を返します。
- カレンダー登録はクライアントが保持する **OAuth アクセストークン** を使って Google Calendar API を直接呼び出します。

### 技術スタック

| 領域           | 採用技術                                                   |
| -------------- | ---------------------------------------------------------- |
| フレームワーク | Next.js 15（App Router / Turbopack）、React 19、TypeScript |
| スタイリング   | Tailwind CSS v4、`tw-animate-css`、Inter + JetBrains Mono  |
| AI             | Google Gemini（`@google/genai`、構造化出力）               |
| 認証           | Firebase Authentication（Google プロバイダ）               |
| カレンダー     | Google Calendar API（REST）                                |
| UI 部品        | lucide-react、motion、react-markdown                       |
| パッケージ管理 | pnpm                                                       |

## 🚀 セットアップ（ローカル開発）

**前提:** Node.js 20+ と [pnpm](https://pnpm.io/) 10+

pnpm を入れていない場合は、Node 同梱の Corepack で有効化できます（`package.json` の `packageManager` で版を固定済み）:

```bash
corepack enable
```

### 1. 依存関係をインストール

```bash
pnpm install
```

### 2. 環境変数を設定

`.env.example` を参考に **`.env.local`** を用意し、ご自身の Gemini API キーを設定します（[Google AI Studio](https://aistudio.google.com/apikey) で取得）。`.env.local` はリポジトリに含まれません。

```env
GEMINI_API_KEY=あなたのGeminiAPIキー
APP_URL=http://localhost:3000
```

| 変数             | 用途                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| `GEMINI_API_KEY` | サーバー側（`app/api/chat/route.ts`）の Gemini 呼び出しに使用。**必須** |
| `APP_URL`        | アプリのホスト URL。ローカルでは `http://localhost:3000` のままで OK    |

### 3. Firebase / Google 側の設定

ログインとカレンダー登録を動かすには、Firebase プロジェクト（接続先は `firebase-applet-config.json`）側で以下が必要です:

- **Authentication で Google ログインを有効化**
- **承認済みドメインに `localhost` を追加**（Firebase Console → Authentication → Settings → Authorized domains）
  → 未追加だとログイン時に `auth/unauthorized-domain` エラーになります。`http://localhost:3000` でアクセスしてください。
- カレンダー登録を使う場合は、対象の Google Cloud プロジェクトで **Google Calendar API を有効化**し、OAuth 同意画面に `calendar.events` スコープを設定

> ℹ️ `firebase-applet-config.json` に含まれる `apiKey` は Firebase Web 用の公開識別子で、秘密情報ではありません。アクセス制御は Firebase Security Rules と API キー制限で行ってください。

### 4. 開発サーバーを起動

```bash
pnpm dev
```

http://localhost:3000 を開きます。

## 📜 スクリプト一覧

| コマンド     | 説明                                    |
| ------------ | --------------------------------------- |
| `pnpm dev`   | 開発サーバーを起動（Turbopack）         |
| `pnpm build` | 本番ビルド（`output: 'standalone'`）    |
| `pnpm start` | 本番ビルドを起動（事前に `pnpm build`） |
| `pnpm lint`  | ESLint を実行                           |

## 📁 ディレクトリ構成

```
app/
  api/chat/route.ts   # Gemini を呼び出すサーバー側 Route Handler
  layout.tsx          # ルートレイアウト（フォント・メタデータ）
  page.tsx            # メイン画面（ログイン / 条件選択 / プラン表示）
  globals.css         # Tailwind v4 のスタイル
lib/
  firebase.ts         # Firebase 初期化・Google サインイン
  calendar.ts         # Google Calendar への予定登録
  utils.ts            # 汎用ユーティリティ
hooks/
  use-mobile.ts       # モバイル判定フック
firebase-applet-config.json  # Firebase Web 設定（公開値）
```

## ☁️ 由来

このアプリは [Google AI Studio](https://ai.studio/apps/98287636-a79d-475a-ba3b-194db702cb12) から書き出した applet をベースにしています。
