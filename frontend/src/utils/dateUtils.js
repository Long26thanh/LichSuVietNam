/**
 * Utility functions for formatting dates from separate day, month, year components
 */

/**
 * Format a date from separate components
 * @param {number|string} day - Day (1-31)
 * @param {number|string} month - Month (1-12)
 * @param {number|string} year - Year
 * @returns {string} Formatted date string
 */
export const formatDate = (day, month, year) => {
    if (!year) return "N/A";
    
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    // Format year with BCE/CE notation
    const yearStr = yearNum < 0 ? `${Math.abs(yearNum)} TCN` : `${yearNum}`;
    
    // If we have month and day
    if (monthNum && dayNum) {
        const monthNames = [
            "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
            "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"
        ];
        const monthName = monthNames[monthNum - 1] || `tháng ${monthNum}`;
        return `${dayNum} ${monthName}, ${yearStr}`;
    }
    
    // If we have only month
    if (monthNum) {
        const monthNames = [
            "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
            "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"
        ];
        const monthName = monthNames[monthNum - 1] || `tháng ${monthNum}`;
        return `${monthName} ${yearStr}`;
    }
    
    // If we have only year
    return yearStr;
};

/**
 * Format a date range from start and end date components
 * @param {Object} startDate - Start date object {day, month, year}
 * @param {Object} endDate - End date object {day, month, year}
 * @returns {string} Formatted date range string
 */
export const formatDateRange = (startDate, endDate) => {
    const { day: startDay, month: startMonth, year: startYear } = startDate || {};
    const { day: endDay, month: endMonth, year: endYear } = endDate || {};
    
    const startFormatted = formatDate(startDay, startMonth, startYear);
    const endFormatted = formatDate(endDay, endMonth, endYear);
    
    if (startFormatted !== "N/A" && endFormatted !== "N/A") {
        return `${startFormatted} - ${endFormatted}`;
    } else if (startFormatted !== "N/A") {
        return `${startFormatted}`;
    } else if (endFormatted !== "N/A") {
        return `${endFormatted}`;
    }
    
    return "N/A";
};

/**
 * Get a short date format for display in cards
 * @param {number|string} day - Day
 * @param {number|string} month - Month
 * @param {number|string} year - Year
 * @returns {string} Short formatted date
 */
export const formatShortDate = (day, month, year) => {
    if (!year) return "N/A";
    
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    const yearStr = yearNum < 0 ? `${Math.abs(yearNum)} TCN` : `${yearNum}`;
    
    if (monthNum && dayNum) {
        return `${dayNum}/${monthNum}/${yearStr}`;
    }
    
    if (monthNum) {
        return `${monthNum}/${yearStr}`;
    }
    
    return yearStr;
};

/**
 * Get a short date range for display in cards
 * @param {Object} startDate - Start date object {day, month, year}
 * @param {Object} endDate - End date object {day, month, year}
 * @returns {string} Short formatted date range
 */
export const formatShortDateRange = (startDate, endDate) => {
    const { day: startDay, month: startMonth, year: startYear } = startDate || {};
    const { day: endDay, month: endMonth, year: endYear } = endDate || {};
    
    const startFormatted = formatShortDate(startDay, startMonth, startYear);
    const endFormatted = formatShortDate(endDay, endMonth, endYear);
    
    if (startFormatted !== "N/A" && endFormatted !== "N/A") {
        return `${startFormatted} - ${endFormatted}`;
    } else if (startFormatted !== "N/A") {
        return startFormatted;
    } else if (endFormatted !== "N/A") {
        return endFormatted;
    }
    
    return "N/A";
};
