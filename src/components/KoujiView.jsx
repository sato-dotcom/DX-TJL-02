import React from 'react';
import { exportToCsv } from 'utils/exportUtils';

export const KoujiView = ({ projects, onAddProject, onEditProject, onDeleteProject }) => {

    const handleExport = () => {
        if (projects.length === 0) {
            alert("エクスポートするデータがありません。");
            return;
        }
        const headers = ['工事ID', '工事名', '発注者', '場所', '工期（開始）', '工期（終了）', '発注担当'];
        const rows = projects.map(p => [
            p.id,
            p.name,
            p.hattyusha || '',
            p.basho || '',
            p.tasks[0]?.startDate || '',
            p.tasks[0]?.endDate || '',
            p.hattyuTantou || ''
        ]);
        exportToCsv('工事一覧表.csv', headers, rows);
    };

    return (
        <div className="max-w-full mx-auto bg-white rounded-b-lg shadow-lg p-6">
            <div className="flex justify-end items-center mb-6">
                <button 
                    onClick={onAddProject} 
                    className="px-4 py-2 mr-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                >
                    新規工事追加
                </button>
                <button 
                    onClick={handleExport} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    CSVエクスポート
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">工事ID</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">工事名</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">発注者</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">場所</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">工期（開始）</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">工期（終了）</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">発注担当</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(project => (
                            <tr key={project.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-sm text-gray-700">{project.id}</td>
                                <td className="p-3 text-sm text-gray-700">{project.name}</td>
                                <td className="p-3 text-sm text-gray-700">{project.hattyusha}</td>
                                <td className="p-3 text-sm text-gray-700">{project.basho}</td>
                                <td className="p-3 text-sm text-gray-700">{project.tasks[0]?.startDate || ''}</td>
                                <td className="p-3 text-sm text-gray-700">{project.tasks[0]?.endDate || ''}</td>
                                <td className="p-3 text-sm text-gray-700">{project.hattyuTantou}</td>
                                <td className="p-3 text-sm text-gray-700">
                                    <button onClick={() => onEditProject(project)} className="text-blue-600 hover:text-blue-800 mr-2">編集</button>
                                    <button onClick={() => onDeleteProject(project.id)} className="text-red-600 hover:text-red-800">削除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

