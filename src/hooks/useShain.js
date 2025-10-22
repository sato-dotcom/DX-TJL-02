import { useState, useEffect } from 'react';
import { db } from 'firebase/firebaseConfig';
import { collection, onSnapshot, doc, setDoc, getDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { parseCSV } from 'utils/dataUtils';

export const useShain = (user, projects) => {
    const [shainList, setShainList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // if (!user) return;
        setIsLoading(true);
        const unsubscribe = onSnapshot(collection(db, "shain"), (snapshot) => {
            const fetchedList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setShainList(fetchedList);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching shain list:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleImportShain = async (csvString) => {
        if (!csvString) {
            alert("CSVデータが空です。");
            return;
        }

        const shainData = parseCSV(csvString);
        if (!shainData || shainData.length === 0) {
            alert("CSVの解析に失敗したか、データがありません。");
            return;
        }

        if (!shainData[0]['社員番号']) {
            alert("CSVに「社員番号」の列が見つかりません。ファイルを確認してください。");
            return;
        }
        
        const confirmation = window.confirm(`${shainData.length}件の社員データをインポートします。同じ社員番号が存在する場合は上書きされます。よろしいですか？`);
        if (!confirmation) return;

        const batch = writeBatch(db);
        let importedCount = 0;

        shainData.forEach(shain => {
            if (shain.社員番号) {
                const docRef = doc(db, "shain", shain.社員番号.trim());
                // 空白のプロパティを削除する
                const cleanedShain = Object.entries(shain).reduce((acc, [key, value]) => {
                    if (value !== null && value !== undefined) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});
                batch.set(docRef, cleanedShain, { merge: true });
                importedCount++;
            }
        });

        try {
            await batch.commit();
            alert(`${importedCount}件の社員データのインポートが完了しました。`);
        } catch (e) {
            console.error("Error importing shain data:", e);
            alert("インポート中にエラーが発生しました。コンソールを確認してください。");
        }
    };


    const handleAddShain = async () => {
        const shainId = prompt("新規社員番号を入力してください:");
        if (!shainId) return;

        const docRef = doc(db, "shain", shainId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            alert("エラー: この社員番号は既に使用されています。");
            return;
        }

        const sei = prompt("姓を入力:", "");
        const mei = prompt("名を入力:", "");
        const jimusho = prompt("事業所を入力:", "山口支店");
        const busho = prompt("部署を入力:", "工事部");
        const email = prompt("メールアドレスを入力:", "");

        if (!sei || !mei) return;

        const newShain = {
            社員番号: shainId,
            姓: sei,
            名: mei,
            事業所: jimusho,
            部署: busho,
            メールアドレス: email,
        };

        try {
            await setDoc(docRef, newShain);
        } catch (e) {
            console.error("Error adding new shain:", e);
        }
    };

    const handleEditShain = async (shain) => {
        const sei = prompt("姓を編集:", shain.姓);
        const mei = prompt("名を編集:", shain.名);
        const jimusho = prompt("事業所を編集:", shain.事業所);
        const busho = prompt("部署を編集:", shain.部署);
        const email = prompt("メールアドレスを編集:", shain.メールアドレス);

        if (sei === null || mei === null || jimusho === null || busho === null || email === null) {
            return;
        }

        const updatedShain = {
            姓: sei,
            名: mei,
            事業所: jimusho,
            部署: busho,
            メールアドレス: email,
        };

        try {
            await updateDoc(doc(db, "shain", shain.id), updatedShain);
        } catch (e) {
            console.error("Error updating shain:", e);
        }
    };

    const handleDeleteShain = async (shainId) => {
        const confirmation = prompt(`社員番号 "${shainId}" を削除します。よろしいですか？\n関連する工事の担当者からも削除されます。\n削除するには「DELETE」と入力してください。`);
        if (confirmation !== 'DELETE') return;

        const batch = writeBatch(db);

        // 1. Delete the shain document
        const shainRef = doc(db, "shain", shainId);
        batch.delete(shainRef);

        // 2. Remove shainId from all projects' assignedTo arrays
        projects.forEach(project => {
            let needsUpdate = false;
            const updatedTasks = project.tasks.map(task => {
                if (task.assignedTo && task.assignedTo.includes(shainId)) {
                    needsUpdate = true;
                    return {
                        ...task,
                        assignedTo: task.assignedTo.filter(id => id !== shainId)
                    };
                }
                return task;
            });

            if (needsUpdate) {
                const projectRef = doc(db, "projects", project.id);
                batch.update(projectRef, { tasks: updatedTasks });
            }
        });

        try {
            await batch.commit();
        } catch (e) {
            console.error("Error deleting shain and updating projects:", e);
        }
    };
    /**
 　* 一括保存処理
 　* ShainView のテーブルで行われたインライン編集を一括でDBに保存する
 　* @param {Object[]} rows - ShainView の 'rows' state
 　*/
const handleSaveAllShain = async (rows) => {
  const batch = writeBatch(db);
  const shainCollection = collection(db, "shain");

  // 重複チェック
  const shainIds = rows.map(row => row.社員番号.trim());
  const uniqueShainIds = new Set(shainIds);
  if (shainIds.length !== uniqueShainIds.size) {
    const errorMsg = "一括保存が中止されました: 保存データ内に重複する社員番号が含まれています。";
    console.error(errorMsg);
    alert(errorMsg);
    return;
  }

  rows.forEach((row) => {
    const shainId = row.社員番号.trim();
    const dataToSave = {
      社員番号: shainId,
      姓: row.姓 || "",
      名: row.名 || "",
      事業所: row.事業所 || "",
      部署: row.部署 || "",
      メールアドレス: row.メールアドレス || "",
    };

    if (String(row.id).startsWith("new_")) {
      // 新規行
      const newDocRef = doc(shainCollection, shainId);
      batch.set(newDocRef, dataToSave);
    } else {
      // 既存行
      const docRef = doc(shainCollection, row.id);
      delete dataToSave.社員番号; // updateDoc では社員番号は更新しない
      batch.update(docRef, dataToSave);
    }
  });

  try {
    await batch.commit();
    console.log("社員データを一括保存しました");
    alert("社員データを一括保存しました。");
  } catch (error) {
    console.error("一括保存に失敗しました:", error);
    alert(`一括保存に失敗しました: ${error.message}`);
  }
};

    return {
  shainList,
  isLoading,
  handleAddShain,
  handleEditShain,
  handleDeleteShain,
  handleImportShain,
  handleSaveAllShain, // ← ここを追加
};
};
