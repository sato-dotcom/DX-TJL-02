import React, { useState, useRef, useEffect } from 'react';

const viewTitles = {
    individual: '個人別日程表',
    manpower: '人員配置表',
    gantt: '全体工程表 (Gantt Chart)',
    kouji: '工事一覧表',
    shain: '社員名簿',
};

export const Header = ({ activeView, setActiveView }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleViewChange = (view) => {
        setActiveView(view);
        setIsMenuOpen(false);
    }

    return (
        <header className="max-w-full mx-auto bg-white rounded-t-lg shadow-lg p-4 flex justify-between items-center sticky top-0 z-50">
            <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {isMenuOpen && (
                    <div className="absolute top-full mt-2 w-64 bg-white rounded-md shadow-xl z-50 border border-gray-200">
                        <ul>
                            {Object.entries(viewTitles).map(([key, title]) => (
                                <li 
                                    key={key}
                                    className={`px-4 py-3 hover:bg-gray-100 cursor-pointer ${activeView === key ? 'font-bold bg-blue-50 text-blue-700' : ''}`} 
                                    onClick={() => handleViewChange(key)}
                                >
                                    {title}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">{viewTitles[activeView]}</h1>
            {/* Empty div for spacing */}
            <div></div>
        </header>
    );
};
