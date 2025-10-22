import React, { useState, useEffect, useRef } from 'react';
import { exportToCsv } from '../utils/exportUtils.js'; // 既存のユーティリティを流用 (パスを修正)

/**
 * 社員名簿の表示・編集コンポーネント
 * * @param {Object[]} initialShainList - useShainフックから渡される社員リストの初期値
 * @param {Function} onAddShain - useShainフックの新規追加処理（モーダル形式）
 * @param {Function} onEditShain - useShainフックの編集処理（モーダル形式）
 * @param {Function} onDeleteShain - useShainフックの削除処理
 * @param {Function} onImportShain - useShainフックのCSVインポート処理
 * @param {Function} onSaveAllShain - (将来拡張用) useShainフックの一括保存処理
 */
export const ShainView = ({ 
    shainList: initialShainList, 
    onAddShain, 
    onEditShain, 
    onDeleteShain, 
    onImportShain,
    onSaveAllShain // App.jsx 経由で useShain.js から渡す想定
}) => {
    
    // propsで受け取った社員リストを、編集可能な内部stateとして保持
    const [rows, setRows] = useState(initialShainList);
    const fileInputRef = useRef(null);

    // props (initialShainList) が外部（Firebase等）からの更新で変更された場合、
    // 内部の編集用state (rows) にも反映させる
    useEffect(() => {
        setRows(initialShainList);
    }, [initialShainList]);

    /**
     * CSVエクスポート処理
     * 内部の 'rows' state を使用してCSVを生成
     */
    const handleExport = () => {
        if (rows.length === 0) {
            alert("エクスポートするデータがありません。"); // alert は将来的にカスタムモーダルに置き換え推奨
            return;
        }

        // エクスポートするカラム（キー）を定義
        const exportKeys = ["社員番号", "姓", "名", "事業所", "部署", "メールアドレス"];
        
        // rowsデータから上記キーに基づいてデータを抽出
        const csvRows = rows.map(row => {
            return exportKeys.map(key => row[key] || ""); // データが存在しない場合は空文字
        });

        exportToCsv('社員名簿.csv', exportKeys, csvRows);
    };

    // (既存機能) CSVインポート用のファイル選択ダイアログを開く
    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    // (既存機能) ファイルが選択されたらインポート処理を実行
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            onImportShain(content); // 親コンポーネント（useShain）の処理を呼び出す
        };
        reader.readAsText(file, 'UTF-8');
        
        event.target.value = null;
    };

    // 1. 「行を追加」ボタンの処理
    const handleAddRow = () => {
        const newRow = {
            id: `new_${Date.now()}`, // 一時的なユニークID（社員番号とは別）
            社員番号: "", // 社員番号はDB保存時に決定（または入力）
            姓: "",
            名: "",
            事業所: "",
            部署: "",
            メールアドレス: "",
        };
        // 新しい行をテーブルの先頭に追加
        setRows([newRow, ...rows]);
    };

    // 2. セルの直接編集処理
    const handleCellChange = (id, field, value) => {
        setRows(rows.map(row => 
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    // 4. 保存処理（将来拡張用）
    const handleSaveChanges = () => {
        // 将来的に onSaveAllShain(rows) を呼び出す
        // onSaveAllShain は useShain.js 側で、rows 配列を受け取り、
        // new_ で始まるIDを持つ行は新規追加（addDoc or setDoc）、
        // 既存のIDを持つ行は更新（updateDoc or setDoc）するロジックを実装する必要がある。
        // （CSVインポート処理(handleImportShain)のロジックが参考になります）
        
        if (typeof onSaveAllShain === 'function') {
             // フィルタリング: 社員番号が入力されている行のみを保存対象とする
            const validRows = rows.filter(row => row.社員番号 && row.社員番号.trim() !== "");
            const invalidRows = rows.filter(row => !row.社員番号 || row.社員番号.trim() === "");

            if (invalidRows.length > 0) {
                alert(`社員番号が空の行が ${invalidRows.length} 件あります。これらは保存されません。`);
            }
            
            if (validRows.length > 0) {
                 onSaveAllShain(validRows);
            } else {
                alert("保存対象の有効なデータがありません。");
            }
        } else {
            console.warn("onSaveAllShain is not defined. Skipping save.");
            alert("保存処理は現在実装中です。");
        }
    };
    
    // (既存機能) 行削除処理
    const handleDeleteRow = (id) => {
        // 新規追加した行（まだ保存されていない）の場合は、stateから削除するだけ
        if (String(id).startsWith('new_')) {
            setRows(rows.filter(row => row.id !== id));
        } else {
            // 既に存在するデータは useShain の削除処理を呼び出す
            onDeleteShain(id);
        }
    };


    return (
        <div className="max-w-full mx-auto bg-white rounded-b-lg shadow-lg p-6">
            {/* --- ボタンエリア --- */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                {/* 1. 「行を追加」ボタン */}
                <button 
                    onClick={handleAddRow} 
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition shadow-sm"
                >
                    ＋ 行を追加
                </button>

                {/* 既存のボタン群 */}
                <div className="flex items-center flex-wrap gap-2">
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        className="hidden"
                    />
                    <button 
                        onClick={handleImportClick} 
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition shadow-sm"
                    >
                        CSVインポート
                    </button>
                    {/* 既存の「新規社員追加」ボタン (モーダル形式) */}
                    <button 
                        onClick={onAddShain} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                    >
                        新規追加 (旧)
                    </button>
                    <button 
                        onClick={handleExport} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        CSVエクスポート
                    </button>
                    {/* 4. 保存ボタン（将来拡張用） */}
                    <button 
                        onClick={handleSaveChanges} 
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        一括保存
                    </button>
                </div>
            </div>

            {/* --- テーブルエリア --- */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                   <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">社員番号</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">姓</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">名</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">事業所</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">部署</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">メールアドレス</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 2. セルの直接編集 */}
                        {rows.map(row => (
                            <tr key={row.id} className="border-b hover:bg-gray-50 group">
                                {/* 社員番号: 既存の行は編集不可 */}
                                <td className="p-0 text-sm text-gray-700">
                                    <input
                                        type="text"
                                        value={row.社員番号 || ""}
                                        onChange={(e) => handleCellChange(row.id, "社員番号", e.target.value)}
                                        className={`w-full p-3 border-none focus:ring-2 focus:ring-blue-500 rounded-none ${!String(row.id).startsWith("new_") ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                                        readOnly={!String(row.id).startsWith("new_")}
                                        placeholder="社員番号 (必須)"
                                    />
                                </td>
                                {/* 姓 */}
                                <td className="p-0 text-sm text-gray-700">
                                    <input
                                        type="text"
                                        value={row.姓 || ""}
                                        onChange={(e) => handleCellChange(row.id, "姓", e.target.value)}
                                        className="w-full p-3 border-none focus:ring-2 focus:ring-blue-500 rounded-none bg-transparent group-hover:bg-white"
                                        placeholder="姓"
                                    />
                                </td>
                                {/* 名 */}
                                <td className="p-0 text-sm text-gray-700">
                                    <input
                                        type="text"
                                        value={row.名 || ""}
                                        onChange={(e) => handleCellChange(row.id, "名", e.target.value)}
                                        className="w-full p-3 border-none focus:ring-2 focus:ring-blue-500 rounded-none bg-transparent group-hover:bg-white"
                                        placeholder="名"
                                    />
                                </td>
                                {/* 事業所 */}
                                <td className="p-0 text-sm text-gray-700">
                                    <input
                                        type="text"
                                        value={row.事業所 || ""}
                                        onChange={(e) => handleCellChange(row.id, "事業所", e.target.value)}
                                        className="w-full p-3 border-none focus:ring-2 focus:ring-blue-500 rounded-none bg-transparent group-hover:bg-white"
                                        placeholder="事業所"
                                    />
                                </td>
                                {/* 部署 */}
                                <td className="p-0 text-sm text-gray-700">
                                    <input
                                        type="text"
                                        value={row.部署 || ""}
                                        onChange={(e) => handleCellChange(row.id, "部署", e.target.value)}
                                        className="w-full p-3 border-none focus:ring-2 focus:ring-blue-500 rounded-none bg-transparent group-hover:bg-white"
                                        placeholder="部署"
                                    />
                                </td>
                                {/* メールアドレス */}
                                <td className="p-0 text-sm text-gray-700">
                                    <input
                                        type="email"
                                        value={row.メールアドレス || ""}
                                        onChange={(e) => handleCellChange(row.id, "メールアドレス", e.target.value)}
                                        className="w-full p-3 border-none focus:ring-2 focus:ring-blue-500 rounded-none bg-transparent group-hover:bg-white"
                                        placeholder="メールアドレス"
                                    />
                                </td>
                                {/* 操作ボタン */}
                                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                                    <button onClick={() => onEditShain(row)} className="text-blue-600 hover:text-blue-800 mr-2" title="古い形式で編集">
                                        編集(旧)
                                    </button>
                                    <button onClick={() => handleDeleteRow(row.id)} className="text-red-600 hover:text-red-800" title="行を削除">
                                        削除
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

