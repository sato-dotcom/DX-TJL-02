import React, { useRef } from 'react';

// 他のコンポーネントも自己完結型に修正したため、
// ここでのインポートが正しく解決されるはずです。
import { ExcelHeader } from 'components/common/ExcelHeader';
import { Toolbar } from 'components/Toolbar';
import { ExcelData } from 'components/ExcelData';

/**
 * The main view component for the Gantt chart.
 * It assembles the toolbar, header, and data table components.
 * @param {object} props - The component props passed from App.jsx.
 */
export const GanttView = ({
    projects,
    shainList,
    dateHeaders,
    minDate,
    onSeedData,
    onUpdateTaskDates,
    onSetProjects
}) => {
    const ganttContainerRef = useRef(null);

    return (
        <div className="max-w-full mx-auto bg-white rounded-b-lg shadow-lg p-6">
            {/* Toolbar for user actions like seeding and exporting */}
            <Toolbar
                onSeedData={onSeedData}
                projects={projects}
                shainList={shainList}
            />
            
            {/* Scrollable container for the Gantt table */}
            <div className="overflow-x-auto" ref={ganttContainerRef}>
                <table className="min-w-full bg-white border border-gray-200 border-collapse">
                    <thead className="sticky top-0 z-40">
                        {/* Excel-like header for dates */}
                        <ExcelHeader headers={dateHeaders} mainLabel="工事名 / タスク名" />
                    </thead>
                    {/* The main body of the table with project and task data */}
                    <ExcelData
                        projects={projects}
                        dateHeaders={dateHeaders}
                        minDate={minDate}
                        onUpdateTaskDates={onUpdateTaskDates}
                        onSetProjects={onSetProjects}
                    />
                </table>
            </div>
        </div>
    );
};

