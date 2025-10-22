import React, { useState, useEffect, useCallback, useRef } from 'react';

// Import constants and utility functions from external files
// NOTE: Corrected the import paths to remove file extensions for proper alias resolution.
import { workCategoryColors, CELL_WIDTH } from 'constants/uiConstants';
import { formatDate } from 'utils/dateUtils';


/**
 * Calculates the width and left margin for a task bar based on its dates.
 * @param {string} taskStartDate - The start date of the task (YYYY-MM-DD).
 * @param {string} taskEndDate - The end date of the task (YYYY-MM-DD).
 * @param {Date} minDate - The earliest date in the entire chart range.
 * @returns {{width: string, marginLeft: string}} - Style object for the task bar.
 */
const calculateBarStyle = (taskStartDate, taskEndDate, minDate) => {
    const start = new Date(taskStartDate);
    const end = new Date(taskEndDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);

    const totalDays = (end - start) / (1000 * 60 * 60 * 24) + 1;
    const offsetDays = (start - min) / (1000 * 60 * 60 * 24);
    
    if (totalDays < 0 || isNaN(totalDays) || isNaN(offsetDays)) {
        return { width: '0px', marginLeft: '0px' };
    }
    
    const barWidth = totalDays * CELL_WIDTH;
    const barOffset = offsetDays * CELL_WIDTH;
    return { width: `${barWidth}px`, marginLeft: `${barOffset}px` };
};

/**
 * Renders the main data table body for the Gantt chart, including drag-to-resize functionality.
 */
export const ExcelData = ({ projects, dateHeaders, minDate, onUpdateTaskDates, onSetProjects }) => {
    const [resizingInfo, setResizingInfo] = useState(null);
    const rowCounter = useRef(4); // Starts from 4 to account for header rows.
    
    // Reset row counter on each render to ensure consistent numbering.
    useEffect(() => { rowCounter.current = 4; });
    
    // Keep a mutable ref to the projects array to access the latest state in mouse event handlers.
    const projectsRef = useRef(projects);
    useEffect(() => { projectsRef.current = projects; }, [projects]);

    /**
     * Handles the mouse down event on a task bar's resize handle.
     */
    const handleMouseDown = (e, projectId, taskId, handle) => {
        e.preventDefault();
        e.stopPropagation();
        
        const task = projects.find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
        if (!task) return;

        setResizingInfo({ 
            projectId, 
            taskId, 
            handle, 
            initialX: e.clientX, 
            initialStartDate: new Date(task.startDate), 
            initialEndDate: new Date(task.endDate) 
        });
    };

    /**
     * Handles the mouse move event to resize the task bar in real-time.
     */
    const handleMouseMove = useCallback((e) => {
        if (!resizingInfo) return;
        
        const dx = e.clientX - resizingInfo.initialX;
        const dayDelta = Math.round(dx / CELL_WIDTH);

        // Update the projects state locally for a smooth visual feedback.
        onSetProjects(prev => prev.map(p => {
            if (p.id !== resizingInfo.projectId) return p;
            return { 
                ...p, 
                tasks: p.tasks.map(t => {
                    if (t.id !== resizingInfo.taskId) return t;
                    
                    let newStartDate = new Date(resizingInfo.initialStartDate);
                    let newEndDate = new Date(resizingInfo.initialEndDate);

                    if (resizingInfo.handle === 'start') {
                        newStartDate.setDate(resizingInfo.initialStartDate.getDate() + dayDelta);
                        if (newStartDate > newEndDate) newStartDate = new Date(newEndDate);
                    } else { // 'end'
                        newEndDate.setDate(resizingInfo.initialEndDate.getDate() + dayDelta);
                        if (newEndDate < newStartDate) newEndDate = new Date(newStartDate);
                    }
                    return { ...t, startDate: formatDate(newStartDate), endDate: formatDate(newEndDate) };
                })
            };
        }));
    }, [resizingInfo, onSetProjects]);

    /**
     * Handles the mouse up event to finalize the resize and update Firestore.
     */
    const handleMouseUp = useCallback(() => {
        if (!resizingInfo) return;
        
        const { projectId, taskId } = resizingInfo;
        const projectForUpdate = projectsRef.current.find(p => p.id === projectId);
        const taskForUpdate = projectForUpdate?.tasks.find(t => t.id === taskId);
        
        if (taskForUpdate) {
          onUpdateTaskDates(projectId, taskId, taskForUpdate.startDate, taskForUpdate.endDate);
        }
        
        setResizingInfo(null); // End resizing session
    }, [resizingInfo, onUpdateTaskDates]);

    // Add and remove global mouse event listeners for resizing.
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <tbody>
            {projects.map((project) => (
                <React.Fragment key={project.id}>
                    {/* Project Title Row */}
                    <tr className="bg-blue-50 border-t-2 border-blue-200">
                        <td className="sticky left-0 bg-blue-50 z-10 p-2 border-r border-b border-gray-200 text-sm font-bold text-gray-900" style={{ width: '48px' }}>
                            {rowCounter.current++}
                        </td>
                        <td colSpan={1 + dateHeaders.length} className="sticky left-48 bg-blue-50 z-10 p-2 border-b border-l border-r border-gray-200 text-sm font-bold text-gray-900" style={{ minWidth: '240px' }}>
                            {project.name}
                        </td>
                    </tr>
                    {/* Task Rows */}
                    {(project.tasks || []).map((task) => {
                        const barStyle = calculateBarStyle(task.startDate, task.endDate, minDate);
                        const bgColor = workCategoryColors[task.workCategory] || 'bg-gray-400';
                        return (
                            <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-50 group h-10">
                                <td className="sticky left-0 bg-white group-hover:bg-gray-50 z-10 p-2 border-r border-b border-gray-200 text-sm" style={{ width: '48px' }}>
                                    {rowCounter.current++}
                                </td>
                                <td className="sticky left-48 bg-white group-hover:bg-gray-50 z-10 p-2 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap" style={{ minWidth: '240px' }}>
                                    {task.name}
                                </td>
                                <td className="relative p-0 border-b border-gray-200" colSpan={dateHeaders.length}>
                                    <div className="relative h-full w-full">
                                        <div 
                                            style={barStyle} 
                                            className={`absolute top-1/2 -translate-y-1/2 h-6 rounded flex items-center justify-center text-xs font-medium px-2 shadow-sm ${bgColor} ${task.workCategory === '活線作業' ? 'text-gray-800' : 'text-white'}`}
                                        >
                                            <div onMouseDown={(e) => handleMouseDown(e, project.id, task.id, 'start')} className="absolute left-0 top-0 h-full w-2 cursor-ew-resize rounded-l z-20"></div>
                                            <span className="truncate">{task.name}</span>
                                            <div onMouseDown={(e) => handleMouseDown(e, project.id, task.id, 'end')} className="absolute right-0 top-0 h-full w-2 cursor-ew-resize rounded-r z-20"></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </React.Fragment>
            ))}
        </tbody>
    );
};

