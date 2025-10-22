import React, { useRef, useEffect } from 'react';
import { ExcelHeader } from 'components/common/ExcelHeader';
import { exportToCsv } from 'utils/exportUtils';
import { formatDate } from 'utils/dateUtils';

export const ManpowerView = ({ projects, dateHeaders }) => {
    const rowCounter = useRef(4);
    useEffect(() => { rowCounter.current = 4; });

    const handleExport = () => {
        const headers = ['工事名', ...dateHeaders.map(d => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`)];
        const rows = projects.map(p => [
            p.name, 
            ...dateHeaders.map(d => {
                const manpower = p.manpower?.[formatDate(d)];
                return manpower ? `${manpower.required}/${manpower.secured}` : '-';
            })
        ]);
        exportToCsv('人員配置表.csv', headers, rows);
    };

    return (
        <div className="max-w-full mx-auto bg-white rounded-b-lg shadow-lg p-6">
            <div className="flex justify-end items-center mb-6">
                <button 
                    onClick={handleExport} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    CSVエクスポート
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="sticky top-0 z-40">
                        <ExcelHeader headers={dateHeaders} mainLabel="工事名" />
                    </thead>
                    <tbody>
                        {projects.map(p => {
                            return (
                                <tr key={p.id} className="border-b">
                                    <td className="sticky left-0 bg-white z-10 p-2 border-r text-sm font-medium" style={{ width: '48px' }}>
                                        {rowCounter.current++}
                                    </td>
                                    <td className="sticky left-48 bg-white z-10 p-2 border-l border-r text-left text-sm" style={{ minWidth: '240px' }}>
                                        {p.name}
                                    </td>
                                    {dateHeaders.map((d, i) => {
                                        const manpower = p.manpower?.[formatDate(d)];
                                        const isUnder = manpower && manpower.secured < manpower.required;
                                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                        return (
                                            <td key={i} className={`p-1 border-l text-center text-xs ${isUnder ? 'bg-red-100' : ''} ${isWeekend ? 'bg-gray-50' : ''}`}>
                                                {manpower ? (
                                                    <>
                                                        <div className="text-gray-700">{manpower.required}</div>
                                                        <div className={`font-semibold ${isUnder ? 'text-red-600' : 'text-green-600'}`}>{manpower.secured}</div>
                                                    </>
                                                ) : (
                                                    <div className="text-gray-400">-</div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

