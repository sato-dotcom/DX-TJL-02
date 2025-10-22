import React from 'react';
import { exportToCsv } from 'utils/exportUtils';

/**
 * Renders the toolbar with buttons for seeding and exporting data.
 * @param {object} props - The component props.
 * @param {Function} props.onSeedData - Function to seed initial data into Firestore.
 * @param {Array<object>} props.projects - The list of projects for CSV export.
 * @param {Array<object>} props.shainList - The list of employees for CSV export.
 */
export const Toolbar = ({ onSeedData, projects, shainList }) => {
    
    /**
     * Handles the CSV export functionality for the Gantt chart data.
     */
    const handleExport = () => {
        // Create a map from shain ID to name for easy lookup.
        const shainNameMap = shainList.reduce((map, shain) => {
            map[shain.id] = `${shain.姓} ${shain.名}`;
            return map;
        }, {});

        const headers = ['工事名', 'タスク名', '作業区分', '開始日', '終了日', '進捗 (%)', '担当者'];
        const rows = projects.flatMap(p => 
            (p.tasks || []).map(t => [
                p.name,
                t.name,
                t.workCategory,
                t.startDate,
                t.endDate,
                t.progress,
                // Map assigned employee IDs to their names.
                t.assignedTo?.map(id => shainNameMap[id] || id).join(', ') || ''
            ])
        );
        exportToCsv('全体工程表.csv', headers, rows);
    };

    return (
        <div className="flex justify-end items-center mb-6">
            <button 
                onClick={onSeedData} 
                className="px-4 py-2 mr-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition shadow-sm"
            >
                CSVデータをDBに登録
            </button>
            <button 
                onClick={handleExport} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
            >
                CSVエクスポート
            </button>
        </div>
    );
};

