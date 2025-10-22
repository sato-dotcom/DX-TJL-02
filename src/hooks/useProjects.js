import { useState, useEffect, useCallback } from 'react';
import { db } from 'firebase/firebaseConfig';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { parseCSV, transformCsvDataToProjects } from 'utils/dataUtils';
import {
  koujiCsvData,
  shainCsvData,
  keirekiCsvData,
} from 'constants/initialData';
import { formatDate } from 'utils/dateUtils';

/**
 * Custom hook for managing project data from Firestore.
 * Handles fetching, adding, editing, deleting, and seeding of project data.
 * @param {object} user - The authenticated user object (currently unused).
 * @returns {object} - State and functions for project management.
 */
export const useProjects = (user) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to subscribe to real-time updates from the 'projects' collection in Firestore.
  useEffect(() => {
    // Note: User-based security rules are not yet implemented.
    // if (!user) {
    //     setIsLoading(false);
    //     return;
    // }
    const unsubscribe = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        const fetchedProjects = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setProjects(fetchedProjects);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching projects:', error);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on component unmount.
    return () => unsubscribe();
  }, [user]);

  /**
   * Seeds initial project data from CSV constants into Firestore.
   * This will overwrite all existing projects.
   */
  const seedData = async () => {
    const confirmation = window.confirm(
      '初期データをFirestoreに登録します。既存のプロジェクトデータはすべて上書きされます。よろしいですか？'
    );
    if (!confirmation) return;

    setIsLoading(true);
    try {
      const transformedProjects = transformCsvDataToProjects(
        koujiCsvData,
        shainCsvData,
        keirekiCsvData
      );

      // Use a batch write for atomic operation.
      const batch = writeBatch(db);
      transformedProjects.forEach((project) => {
        const docRef = doc(db, 'projects', project.id);
        batch.set(docRef, project);
      });
      await batch.commit();
      alert('初期データの登録が完了しました。');
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('データの登録中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adds a new project to Firestore.
   */
  const handleAddProject = async () => {
    const koujiId = prompt('新規工事IDを入力してください:');
    if (!koujiId) return;

    const docRef = doc(db, 'projects', koujiId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      alert('エラー: この工事IDは既に使用されています。');
      return;
    }

    const name = prompt('工事名を入力:', '');
    const hattyusha = prompt('発注者を入力:', '');
    const basho = prompt('場所を入力:', '');
    const startDate = prompt('工期（開始）を入力 (YYYY-MM-DD):', formatDate(new Date()));
    const endDate = prompt('工期（終了）を入力 (YYYY-MM-DD):', formatDate(new Date()));

    if (!name || !startDate || !endDate) {
      alert('工事名と工期は必須です。');
      return;
    }

    const newProject = {
      id: koujiId,
      name,
      hattyusha,
      basho,
      tasks: [
        {
          id: koujiId, // Main task id is same as project id
          name,
          startDate,
          endDate,
          progress: 0,
          workCategory: '一般作業',
          assignedTo: [],
        },
      ],
      manpower: {},
    };

    try {
      await setDoc(docRef, newProject);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  /**
   * Edits an existing project in Firestore.
   * @param {object} project - The project object to edit.
   */
  const handleEditProject = async (project) => {
    const name = prompt('工事名を編集:', project.name);
    const hattyusha = prompt('発注者を編集:', project.hattyusha);
    const basho = prompt('場所を編集:', project.basho);
    const startDate = prompt('工期（開始）を編集:', project.tasks[0]?.startDate || '');
    const endDate = prompt('工期（終了）を編集:', project.tasks[0]?.endDate || '');

    if (name === null || hattyusha === null || basho === null || startDate === null || endDate === null) {
        return; // User cancelled
    }
    
    const updatedProject = {
      ...project,
      name,
      hattyusha,
      basho,
      tasks: [
        {
          ...project.tasks[0],
          name,
          startDate,
          endDate,
        },
      ],
    };

    try {
      await updateDoc(doc(db, 'projects', project.id), updatedProject);
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  };

  /**
   * Deletes a project from Firestore.
   * @param {string} projectId - The ID of the project to delete.
   */
  const handleDeleteProject = async (projectId) => {
    const confirmation = prompt(`工事ID "${projectId}" を削除しますか？\nこの操作は元に戻せません。削除するには「DELETE」と入力してください。`);
    if (confirmation !== 'DELETE') return;

    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (e) {
      console.error('Error deleting document: ', e);
    }
  };

  /**
   * Updates the start and end dates of a specific task within a project.
   * @param {string} projectId - The ID of the project.
   * @param {string} taskId - The ID of the task to update.
   * @param {string} newStartDate - The new start date.
   * @param {string} newEndDate - The new end date.
   */
  const updateTaskDates = useCallback(async (projectId, taskId, newStartDate, newEndDate) => {
      const projectRef = doc(db, 'projects', projectId);
      try {
        const projectDoc = await getDoc(projectRef);
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          const updatedTasks = projectData.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, startDate: newStartDate, endDate: newEndDate };
            }
            return task;
          });
          await updateDoc(projectRef, { tasks: updatedTasks });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error updating task dates: ", error);
      }
    }, []);


  return {
    projects,
    setProjects,
    isLoading,
    seedData,
    handleAddProject,
    handleEditProject,
    handleDeleteProject,
    updateTaskDates,
  };
};
