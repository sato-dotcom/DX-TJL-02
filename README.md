**DX-TJL** は、建設・測量・土木分野における業務情報を統合・管理するためのツールです。 「日程・工程表」「社員名簿」「人員配置表」「車両・機材管理表」など、従来は個別に管理されていた情報をリンクさせ、現場とオフィスの両方で効率的に活用できる仕組みを提供します。

## 🎯 目的

- 業務データを一元管理し、重複入力や情報の齟齬を防ぐ
    
- 現場担当者と管理者が同じ情報をリアルタイムに共有できる環境を整備
    
- プロジェクト進行に必要な「人・モノ・時間」のリソースを見える化
    

## ✨ 主な機能

- **日程・工程表管理**：ガントチャートで進捗を可視化
    
- **社員名簿**：社員情報を一元管理し、配置や連絡に活用
    
- **人員配置表**：現場ごとの人員割り当てを自動・半自動で生成
    
- **車両・機材管理**：利用状況や予約状況を追跡
    
- **データ連携**：各表の情報をリンクさせ、変更が全体に反映される仕組み
    
- **ログ・履歴管理**：更新履歴を残し、透明性と再現性を確保
    

## 📂 フォルダ構成と概要

sDX-TJL/
├── node_modules/
├── public/
├──.gitignore
├──eslint.config.js
├──index.html
├──package.json
├──package-lock.json
├──vite.config.js
└src/
  │  App.css :App.jsx コンポーネントに適用されるスタイルシート。
  │  App.jsx :アプリケーションのメインコンポーネント。 各画面（GanttView など）の表示を切り替えるルーターのような役割を持つ。
  │  index.css :アプリケーション全体に適用されるグローバルなスタイルシート。
  │  main.jsx :Reactアプリケーションのルートエントリーポイント。 ここで App コンポーネントがHTMLに描画される。
  │  
  ├─assets
  │      react.svg :: 画像などの静的ファイル。
  │      
  ├─components
  │  │  GanttView.jsx :ガントチャート本体
  │  │  Toolbar.jsx :ツールバー
  │  │  ExcelData.jsx :工程データを表示するテーブルの本体部分（行データ）のロジックとJSX
  │  │  Header.jsx :アプリケーション全体のヘッダー。 画面を切り替えるメニューボタンやタイトルを表示する。
  │  │  IndividualView.jsx :個人別日程表の表示ロジックとテーブル。
  │  │  KoujiView.jsx :工事一覧表の表示ロジックとテーブル。
  │  │  ManpowerView.jsx :人員配置表の表示ロジックとテーブル。
  │  │  ShainView.jsx :社員名簿の表示ロジックとテーブル。
  │  │  
  │  └─common
  │          ExcelHeader.jsx :ガントチャートのテーブル部分の日付ヘッダーを表示するコンポーネント。
  │          
  ├─constants
  │      initialData.js :アプリケーションの初期データとなるCSV形式の文字列 (koujiCsvData など)。
  │      uiConstants.js :セルの幅など、UI表示に関する共通の定数。
  │      
  ├─firebase
  │      firebaseConfig.js :Firebaseの初期化と設定情報 (db, auth のエクスポート)
  │      
  ├─hooks
  │      useProjects.js :Firestore から projects データを取得・更新するカスタムフック
  │      useShain.js :Firestore から shainList データを取得・更新するカスタムフック
  │      
  └─utils
          dataUtils.js :CSV文字列の解析やデータ形式の変換など、データ処理に関する関数 (parseCSV など)。
          dateUtils.js :日付のフォーマットや期間計算など、日付処理に関する関数 (formatDate など)。
          exportUtils.js :データをCSV形式でダウンロードするなど、エクスポート処理に関する関数。

```

## 🚀 セットアップ

1. このリポジトリを clone
git clone https://github.com/sato-dotcom/DX-TJL-02.git
cd DX-TJL-02

2. `.env.example` をコピーして `.env` を作成

3. Firebase APIキーなどを設定

4. 依存関係インストール（例: Node.js 環境の場合）
- npm install


5. アプリ起動
- npm run dev

```

## 🛠️ 技術スタック

- フロントエンド: React
    
- バックエンド: Firebase (Firestore, Auth)
    
- データ管理: CSV 入出力 + Firestore
    
- ユーティリティ: 独自 hooks / utils によるデータ処理
    

## 📖 利用シナリオ例

- **社員を追加** → 社員名簿に反映され、人員配置表や工程表にも自動リンク
    
- **工事データを更新** → 工事一覧ビューとガントチャートに即時反映
    
- **車両予約を登録** → 他のユーザーも同じ情報をリアルタイムで確認可能
    

## 🤝 貢献方法

- Issue でのバグ報告・機能提案を歓迎
    
- Pull Request 前に簡単な説明をお願いします
    
- コーディング規約やドキュメント整備は随時追加予定

### 開発環境上の注意

本プロジェクトはブラウザ上では正常に動作しますが、Gemini Canvas のレビュー機能では
相対パス解決やデータ階層の自動リンク処理によりエラーが表示される場合があります。
これらは実行環境には影響しないため、レビューエラーは無視して開発を進めてください。
    
### 開発環境設定（エイリアス）

- Firebase SDK v11.x 対応済み

本プロジェクトでは import パスを簡潔にするため、Vite のエイリアスを設定しています。  
そのため、`App.jsx` などから以下のように記述できます。

```js
import { Header } from 'components/Header.jsx';
import { useProjects } from 'hooks/useProjects.js';
import { getDateRangeAndHeaders } from 'utils/dateUtils.js';

vite.config.js の設定

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      hooks: path.resolve(__dirname, './src/hooks'),
      utils: path.resolve(__dirname, './src/utils'),
      constants: path.resolve(__dirname, './src/constants'),
    },
  },
});

注意点
• 	環境依存：この設定がないと components/... のような import は解決できません。
→ 他の人が clone した場合は必ず vite.config.js を共有してください。
• 	学習コスト：新しく参加する人には「エイリアスを使っている」ことを説明する必要があります。
• 	移植性：もし別のビルド環境（例: Next.js, CRA）に移行する場合は、同様のエイリアス設定を追加する必要があります。

## 🛠️ トラブルシューティング

### Firebase import 解決エラー (Vite 環境)

#### 症状

Vite 開発サーバー起動時に以下のようなエラーが発生することがある：

コード

コピー

```
Failed to resolve import "firebase/app"
Failed to resolve import "firebase/firestore"
```

Copy

#### 原因

- `vite.config.js` の alias 設定で `firebase` を `src/firebase` に割り当てていたため、
    
    - `import { db } from "firebase/firebaseConfig";` は意図通り動作するが、
        
    - `import { getFirestore } from "firebase/firestore";` など SDK 側の import まで `src/firebase/firestore` を探しに行ってしまう。
        
- 結果として npm の Firebase SDK と自作の `firebaseConfig.js` が衝突し、解決不能になる。
    

#### 対応方法

1. **Firebase SDK のバージョンを安定版に固定**
    
    - v12 系は Vite との相性問題があるため、`firebase@11.10.0` を利用する。
        
    
    bash
    
    コピー
    
    ```
    npm install firebase@11
    ```
    
    Copy
    
2. **vite.config.js の alias を修正**
    
    - `firebase` 全体を alias せず、`firebase/firebaseConfig` のみに限定する。
        
    
    js
    
    コピー
    
    ```
    // vite.config.js
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import path from 'path';
    
    export default defineConfig({
      plugins: [react()],
      resolve: {
        alias: [
          { find: 'components', replacement: path.resolve(__dirname, './src/components') },
          { find: 'hooks',      replacement: path.resolve(__dirname, './src/hooks') },
          { find: 'utils',      replacement: path.resolve(__dirname, './src/utils') },
          { find: 'constants',  replacement: path.resolve(__dirname, './src/constants') },
    
          // Firebase SDK と衝突しないように限定 alias
          { find: /^firebase\/firebaseConfig$/, replacement: path.resolve(__dirname, './src/firebase/firebaseConfig.js') },
        ],
      },
      optimizeDeps: {
        include: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
      },
    });
    ```
    
    Copy
    
3. **キャッシュをクリアして再起動**
    
    bash
    
    コピー
    
    ```
    rm -rf node_modules/.vite
    npm run dev
    ```
    
    Copy
    

#### 結果

- `firebase/app`, `firebase/firestore`, `firebase/auth` は npm パッケージを正しく参照。
    
- `firebase/firebaseConfig` は自作の `src/firebase/firebaseConfig.js` を参照。
    
- Firebase SDK の import 解決エラーが解消し、開発サーバーが正常起動する。


## 📜 ライセンス

TBD（未設定）




## 📘 資格マスタ設計方針（README 追記用ドラフト）

### 🎯 目的

- 社員の資格取得状況を一元管理するための「資格マスタ」を定義する
    
- 旧制度・新制度の両方に対応し、制度改正や経過措置にも柔軟に対応できるようにする
    
- 将来的に社員データ・資産管理（車両・重機・機材）とリンクさせ、人員配置や資格更新管理に活用する
    

### 🗂️ データ構造の基本方針

- コレクション名: `qualification_master`
    
- 各資格を 1 ドキュメントとして管理
    
- **旧制度 (old)** と **新制度 (new)** を `levels` 配列で並列に保持
    
- 制度改正の経過措置は `transitionPeriod` で表現
    

### 📑 ドキュメント例

#### 1級土木施工管理技士

json

コピー

```
{
  "id": "civil_construction_1",
  "name": "1級土木施工管理技士",
  "category": "civil",
  "levels": [
    {
      "system": "old",
      "educationRequirements": {
        "university_designated": { "years": 3 },
        "college_designated": { "years": 5 },
        "highschool_designated": { "years": 10 }
      },
      "supervisoryExperience": 1,
      "notes": "学歴に応じて必要な実務経験年数が異なる。指導監督的実務経験1年以上を含む。"
    },
    {
      "system": "new",
      "firstExam": { "age": 19 },
      "secondExam": {
        "experienceYears": 5,
        "specialExperienceYears": 3
      },
      "transitionPeriod": { "from": 2024, "to": 2029 },
      "notes": "第一次検定は年齢要件のみ。第二次検定は合格後の実務経験年数で判定。"
    }
  ]
}
```

Copy

### 🔑 設計のポイント

- **旧制度と新制度を両方保持** → 過去の社員データも将来の受験者も同じ枠組みで管理可能
    
- **教育要件・経験年数を柔軟に表現** → 学歴や学科による差異を `educationRequirements` に保持
    
- **経過措置を transitionPeriod で管理** → 制度改正の移行期を明示
    
- **notes フィールド**で制度の細かい条件や例外を補足
    

### 🚀 将来の拡張

- `employee_qualifications` とリンクして「資格進捗（planned, in\_progress, acquired, expired）」を管理
    
- `assets` コレクションと関連付けて「必要資格を持つ社員だけが利用可能な資産」を判定
    
- 有効期限付き資格（例: 自動車免許、技能講習）にも対応可能
    

👉 この方針を