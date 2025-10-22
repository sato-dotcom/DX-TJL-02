import React, { useRef, useEffect } from 'react';
import { ExcelHeader } from 'components/common/ExcelHeader';
import { exportToCsv } from 'utils/exportUtils';
import { formatDate } from 'utils/dateUtils';
import { workCategoryColors } from 'constants/uiConstants';

const getTasksForIndividualOnDate = (shainId, date, projects) => {
    const formattedDate = formatDate(date);
    const assignedTasks = [];
    projects.forEach(project => {
        (project.tasks || []).forEach(task => {
            if (task.assignedTo && task.assignedTo.includes(shainId)) {
                const taskStartDate = new Date(task.startDate);
                const taskEndDate = new Date(task.endDate);
                const checkDate = new Date(formattedDate);
                // Reset time part to compare dates only
                taskStartDate.setHours(0, 0, 0, 0);
                taskEndDate.setHours(0, 0, 0, 0);
                checkDate.setHours(0, 0, 0, 0);

                if (checkDate >= taskStartDate && checkDate <= taskEndDate) {
                    assignedTasks.push({ 
                        projectId: project.id, 
                        projectName: project.name, 
                        taskName: task.name, 
                        workCategory: task.workCategory 
                    });
                }
            }
        });
    });
    return assignedTasks;
};


export const IndividualView = ({ shainList, projects, dateHeaders }) => {
    const rowCounter = useRef(4);
    useEffect(() => { rowCounter.current = 4; }); // Reset counter on re-render

    const handleExport = () => {
        const headers = ['個人名', ...dateHeaders.map(d => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`)];
        const rows = shainList.map(shain => {
            const name = `${shain.姓 || ''} ${shain.名 || ''}`;
            const schedule = dateHeaders.map(d => 
                getTasksForIndividualOnDate(shain.id, d, projects)
                    .map(t => `[${t.projectName}]`)
                    .join(', ') || '-'
            );
            return [name, ...schedule];
        });
        exportToCsv('個人別日程表.csv', headers, rows);
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
                        <ExcelHeader headers={dateHeaders} mainLabel="個人名＼日付" />
                    </thead>
                    <tbody>
                        {shainList.map(shain => (
                            <tr key={shain.id} className="border-b">
                                <td className="sticky left-0 bg-white z-10 p-2 border-r text-sm font-medium" style={{ width: '48px' }}>
                                    {rowCounter.current++}
                                </td>
                                <td className="sticky left-48 bg-white z-10 p-2 border-l border-r text-left text-sm" style={{ minWidth: '240px' }}>
                                    {`${shain.姓} ${shain.名}`}
                                </td>
                                {dateHeaders.map((d, i) => {
                                    const tasks = getTasksForIndividualOnDate(shain.id, d, projects);
                                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                    return (
                                        <td key={i} className={`p-1 border-l text-center text-xs align-top ${isWeekend ? 'bg-gray-50' : ''}`}>
                                            {tasks.length > 0 ? (
                                                <div className="flex flex-col items-stretch justify-start space-y-1">
                                                    {tasks.map((t, ti) => (
                                                        <div 
                                                            key={ti} 
                                                            className={`${workCategoryColors[t.workCategory] || 'bg-gray-100'} ${t.workCategory === '活線作業' ? 'text-gray-800' : 'text-white'} rounded-md px-1 py-0.5 text-xs`}
                                                        >
                                                            <div className="font-semibold truncate">[{t.projectName}]</div>
                                                            <div className="truncate">{t.taskName}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-gray-400">-</div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

