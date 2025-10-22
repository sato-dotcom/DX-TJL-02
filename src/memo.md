ファイル名,格納先ディレクトリ,拡張子,役割
firebaseConfig.js,src/firebase/,.js,"Firebaseの初期化と設定情報 (db, auth のエクスポート)"
initialData.js,src/constants/,.js,初期データとなる3つのCSV文字列 (koujiCsvData 等)
dataUtils.js,src/utils/,.js,parseCSV や transformCsvDataToProjects といったデータ処理関数
dateUtils.js,src/utils/,.js,"formatDate, getDateRangeAndHeaders などの日付関連関数"
useProjects.js,src/hooks/,.js,Firestore から projects データを取得・更新するカスタムフック
useShain.js,src/hooks/,.js,Firestore から shainList データを取得・更新するカスタムフック
Header.jsx,src/components/,.jsx,メニューボタンやタイトルを含むヘッダーコンポーネント
GanttView.jsx,src/components/,.jsx,全体工程表の表示ロジックとテーブル
IndividualView.jsx,src/components/,.jsx,個人別日程表の表示ロジックとテーブル
ManpowerView.jsx,src/components/,.jsx,人員配置表の表示ロジックとテーブル
KoujiView.jsx,src/components/,.jsx,工事一覧表の表示ロジックとテーブル
ShainView.jsx,src/components/,.jsx,社員名簿の表示ロジックとテーブル
App.jsx,src/,.jsx,(リファクタリング後) 各コンポーネントを束ね、表示を切り替える役割