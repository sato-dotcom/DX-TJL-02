/**
 * Formats a Date object or date string into 'YYYY-MM-DD' format.
 * @param {Date|string} date The date to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates the date range from all tasks in the projects
 * and generates an array of Date objects for the headers.
 * @param {Array<Object>} projects Array of project objects.
 * @returns {{dateHeaders: Array<Date>, minDate: Date, maxDate: Date}}
 */
export const getDateRangeAndHeaders = (projects) => {
    const dates = [];
    (projects || []).forEach(project => {
        (project.tasks || []).forEach(task => {
            if (!task.startDate || !task.endDate) return;
            let currentDate = new Date(task.startDate);
            const lastDate = new Date(task.endDate);
            // Ensure we don't get into an infinite loop
            if (currentDate > lastDate) return;

            while (currentDate <= lastDate) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });
    });

    // If there are no dates, create a default range (e.g., today + 60 days).
    if (dates.length === 0) {
        let today = new Date();
        let dateHeaders = [];
        for(let i = 0; i < 60; i++){
            let newDate = new Date(today);
            newDate.setDate(today.getDate() + i);
            dateHeaders.push(newDate);
        }
        return {
            dateHeaders,
            minDate: dateHeaders[0],
            maxDate: dateHeaders[dateHeaders.length - 1]
        };
    }

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    const dateHeaders = [];
    // Add some padding to the start and end dates for better visualization.
    let currentDateHeader = new Date(minDate);
    currentDateHeader.setDate(currentDateHeader.getDate() - 14);
    
    let tempMaxDate = new Date(maxDate);
    tempMaxDate.setDate(tempMaxDate.getDate() + 14);

    while (currentDateHeader <= tempMaxDate) {
        dateHeaders.push(new Date(currentDateHeader));
        currentDateHeader.setDate(currentDateHeader.getDate() + 1);
    }

    return { dateHeaders, minDate: dateHeaders[0], maxDate: tempMaxDate };
};
