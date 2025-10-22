/**
 * Parses a CSV string into an array of objects.
 * @param {string} csvString The CSV string to parse.
 * @returns {Array<Object>} An array of objects representing the CSV rows.
 */
export function parseCSV(csvString) {
    const rows = csvString.trim().split('\n');
    if (rows.length <= 1) return [];
    const header = rows.shift().split(',');
    return rows.map(row => {
        // This regex handles quoted strings to prevent splitting commas within them.
        const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        return header.reduce((obj, key, index) => {
            const value = (values[index] || '').trim().replace(/"/g, '');
            obj[key.trim()] = value;
            return obj;
        }, {});
    });
}

/**
 * Transforms raw CSV data into the project structure required by the application.
 * @param {string} koujiCSV - CSV string for construction projects.
 * @param {string} shainCSV - CSV string for employees.
 * @param {string} keirekiCSV - CSV string for career history/assignments.
 * @returns {Array<Object>} An array of project objects.
 */
export function transformCsvDataToProjects(koujiCSV, shainCSV, keirekiCSV) {
    const koujiData = parseCSV(koujiCSV);
    const shainData = parseCSV(shainCSV);
    const keirekiData = parseCSV(keirekiCSV);

    // Create a map of project IDs to assigned employee IDs for quick lookup.
    const keirekiMap = keirekiData.reduce((map, keireki) => {
        const koujiId = keireki.工事ID;
        if (koujiId) {
            if (!map[koujiId]) {
                map[koujiId] = [];
            }
            map[koujiId].push(keireki.社員番号);
        }
        return map;
    }, {});
    
    const projects = koujiData
      // Filter out rows that are missing essential data.
      .filter(kouji => kouji.工事ID && kouji['工期（開始）'] && kouji['工期（終了）'])
      .map((kouji) => {
        const koujiId = kouji.工事ID;
        // Use a Set to ensure unique employee IDs per project.
        const assignedShainIds = [...new Set(keirekiMap[koujiId] || [])];

        const startDate = kouji['工期（開始）'].replace(/\//g, '-');
        const endDate = kouji['工期（終了）'].replace(/\//g, '-');
        
        // This structure is the main task for the gantt chart.
        const task = {
            id: koujiId, // The main task ID is the same as the project ID.
            name: kouji.工事名,
            workCategory: '一般作業', // Default category
            startDate: startDate,
            endDate: endDate,
            progress: 0,
            assignedTo: assignedShainIds,
        };

        // The final project object structure.
        return {
            id: koujiId,
            name: kouji.工事名,
            hattyusha: kouji.発注者 || '',
            basho: kouji.場所 || '',
            hattyuTantou: kouji.発注担当 || '',
            dairininKubun: kouji.代理人区分 || '',
            tasks: [task], // Currently, one main task per project.
            manpower: {}, // Manpower data can be added later.
        };
    });

    return projects;
}
