import React from 'react';
import { CELL_WIDTH } from '../../constants/uiConstants.js';
import { formatDate } from '../../utils/dateUtils.js';

const getExcelColLetter = (colIndex) => {
  let name = '';
  let dividend = colIndex + 1;
  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    name = String.fromCharCode(65 + modulo) + name;
    dividend = Math.floor((dividend - 1) / 26);
  }
  return name;
};

export const ExcelHeader = ({ headers, mainLabel }) => {
    const yearCells = [], monthCells = [], dayCells = [];
    let currentYear = null, currentMonth = null, yearStartColIndex = 0, monthStartColIndex = 0;

    headers.forEach((date, index) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        if (year !== currentYear) {
            if (currentYear !== null) yearCells.push(<th key={`y-${currentYear}`} colSpan={index - yearStartColIndex} className="p-2 border-b border-l border-gray-200 text-center text-xs font-medium text-gray-600">{currentYear}</th>);
            currentYear = year; yearStartColIndex = index;
        }
        if (month !== currentMonth || year !== new Date(headers[yearStartColIndex]).getFullYear()) {
             if (currentMonth !== null) monthCells.push(<th key={`m-${currentYear}-${currentMonth}`} colSpan={index - monthStartColIndex} className="p-2 border-b border-l border-gray-200 text-center text-xs font-medium text-gray-600">{currentMonth}</th>);
            currentMonth = month; monthStartColIndex = index;
        }
    });
    if (currentYear !== null) yearCells.push(<th key={`y-${currentYear}`} colSpan={headers.length - yearStartColIndex} className="p-2 border-b border-l border-gray-200 text-center text-xs font-medium text-gray-600">{currentYear}</th>);
    if (currentMonth !== null) monthCells.push(<th key={`m-${currentYear}-${currentMonth}`} colSpan={headers.length - monthStartColIndex} className="p-2 border-b border-l border-gray-200 text-center text-xs font-medium text-gray-600">{currentMonth}</th>);
    
    headers.forEach(date => {
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        dayCells.push(<th key={`d-${formatDate(date)}`} className={`p-2 border-b border-l border-gray-200 text-center text-xs font-medium ${isWeekend ? 'text-red-500 bg-red-50' : 'text-gray-600'}`} style={{ minWidth: `${CELL_WIDTH}px` }}>{date.getDate()}</th>);
    });

    const commonThClass = "sticky bg-gray-50 z-20 p-2 border-b text-sm font-semibold text-gray-700";
    const commonThStyle = { minWidth: '240px' };

    return (<>
        <tr className="bg-gray-100">
            <th className="sticky left-0 bg-gray-100 z-30 p-2 border-r border-b border-gray-200" style={{ width: '48px' }}>&nbsp;</th>
            <th className="sticky left-48 bg-gray-100 z-30 p-2 border-b border-l border-r border-gray-200 text-center text-xs font-medium text-gray-600" style={commonThStyle}>A</th>
            {headers.map((_, i) => <th key={i} className="p-2 border-b border-l border-gray-200 text-center text-xs font-medium text-gray-600" style={{ minWidth: `${CELL_WIDTH}px` }}>{getExcelColLetter(i + 1)}</th>)}
        </tr>
        <tr className="bg-gray-50">
            <th className={`${commonThClass} left-0 border-r`} style={{ width: '48px' }}>1</th><th className={`${commonThClass} left-48 border-l border-r`} style={commonThStyle}>年</th>{yearCells}
        </tr>
        <tr className="bg-gray-50">
            <th className={`${commonThClass} left-0 border-r`} style={{ width: '48px' }}>2</th><th className={`${commonThClass} left-48 border-l border-r`} style={commonThStyle}>月</th>{monthCells}
        </tr>
        <tr className="bg-gray-50">
            <th className={`${commonThClass} left-0 border-r`} style={{ width: '48px' }}>3</th><th className={`${commonThClass} left-48 border-l border-r`} style={commonThStyle}>{mainLabel}</th>{dayCells}
        </tr>
    </>);
};
