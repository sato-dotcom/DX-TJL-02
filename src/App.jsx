import React, { useState } from 'react';

// Custom Hooks for data management (using absolute paths via alias)
import { useProjects } from 'hooks/useProjects.js';
import { useShain } from 'hooks/useShain.js';

// Utility functions (using absolute paths via alias)
import { getDateRangeAndHeaders } from 'utils/dateUtils.js';

// UI Components (using absolute paths via alias)
import { Header } from 'components/Header.jsx';
import { GanttView } from 'components/GanttView.jsx';
import { IndividualView } from 'components/IndividualView.jsx';
import { ManpowerView } from 'components/ManpowerView.jsx';
import { KoujiView } from 'components/KoujiView.jsx';
import { ShainView } from 'components/ShainView.jsx';

const App = () => {
  // 1. State Management
  const [activeView, setActiveView] = useState('gantt'); // Default view
  
  // 2. Data Fetching and Management via Custom Hooks
  // NOTE: Assuming user authentication is not yet implemented, so passing null for user.
  const { 
    projects, 
    setProjects, 
    isLoading: isLoadingProjects, 
    seedData: seedInitialData, // Renamed for clarity from original file
    handleAddProject: addProject, 
    handleEditProject: editProject, 
    handleDeleteProject: deleteProject,
    updateTaskDates
  } = useProjects(null);
  
  const { 
    shainList, 
    isLoading: isLoadingShain, 
    handleAddShain: addShain, 
    handleEditShain: editShain, 
    handleDeleteShain: deleteShain,
    handleImportShain: importShain
  } = useShain(null, projects); // Pass null for user, and projects for dependency updates

  // 3. Derived State Calculation
  const { dateHeaders, minDate } = getDateRangeAndHeaders(projects);
  
  const isLoading = isLoadingProjects || isLoadingShain;

  // 4. Render Logic
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold text-gray-700">データを読み込んでいます...</div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'gantt':
        return <GanttView 
                  projects={projects} 
                  shainList={shainList}
                  dateHeaders={dateHeaders} 
                  minDate={minDate}
                  onSeedData={seedInitialData}
                  onUpdateTaskDates={updateTaskDates}
                  onSetProjects={setProjects}
               />;
      case 'individual':
        return <IndividualView 
                  shainList={shainList} 
                  projects={projects} 
                  dateHeaders={dateHeaders} 
               />;
      case 'manpower':
        return <ManpowerView 
                  projects={projects} 
                  dateHeaders={dateHeaders} 
               />;
      case 'kouji':
        return <KoujiView 
                  projects={projects}
                  onAddProject={addProject}
                  onEditProject={editProject}
                  onDeleteProject={deleteProject}
               />;
      case 'shain':
        return <ShainView 
                  shainList={shainList} 
                  onAddShain={addShain}
                  onEditShain={editShain}
                  onDeleteShain={deleteShain}
                  onImportShain={importShain}
               />;
      default:
        return <div>ビューが見つかりません。</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main>
        {renderActiveView()}
      </main>
    </div>
  );
};

export default App;

