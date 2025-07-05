// Time utility functions for 12-hour and 24-hour format conversions

/**
 * Convert 24-hour time to 12-hour format
 * @param {string} time24 - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format (HH:MM AM/PM)
 */
export const convert24To12 = (time24) => {
  if (!time24 || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time24)) {
    return time24;
  }

  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Convert 12-hour time to 24-hour format
 * @param {string} time12 - Time in 12-hour format (HH:MM AM/PM)
 * @returns {string} Time in 24-hour format (HH:MM)
 */
export const convert12To24 = (time12) => {
  if (!time12) return time12;
  
  // Handle various 12-hour formats
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/);
  if (!match) return time12;

  let [, hours, minutes, period] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Validate 12-hour time format
 * @param {string} time12 - Time string to validate
 * @returns {boolean} True if valid 12-hour format
 */
export const isValid12HourTime = (time12) => {
  if (!time12) return true; // Allow empty values
  const pattern = /^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/;
  if (!pattern.test(time12)) return false;
  
  const match = time12.match(pattern);
  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  
  return hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59;
};

/**
 * Format time for display (12-hour format)
 * @param {string} time24 - Time in 24-hour format
 * @returns {string} Formatted time for display
 */
export const formatTimeForDisplay = (time24) => {
  return convert24To12(time24);
};

/**
 * Parse time input and convert to 24-hour format for storage
 * @param {string} timeInput - User input (can be 12-hour or 24-hour)
 * @returns {string} Time in 24-hour format
 */
export const parseTimeInput = (timeInput) => {
  if (!timeInput) return timeInput;
  
  // If it's already in 24-hour format, return as is
  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeInput)) {
    return timeInput;
  }
  
  // If it's in 12-hour format, convert to 24-hour
  if (isValid12HourTime(timeInput)) {
    return convert12To24(timeInput);
  }
  
  return timeInput; // Return as is if invalid
}; 