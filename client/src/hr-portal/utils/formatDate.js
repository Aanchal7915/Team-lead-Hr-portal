// src/utils/formatDate.js

/**
 * Formats a date string or Date object into a more readable format.
 * e.g., "2023-10-27T10:00:00.000Z" -> "October 27, 2023"
 * @param {string | Date} dateInput The date to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC' // Assuming dates from DB are UTC
  });
};

/**
 * Formats a date string or Date object into a time string.
 * e.g., "2023-10-27T10:00:00.000Z" -> "10:00:00 AM"
 * @param {string | Date} dateInput The date to format.
 * @returns {string} The formatted time string.
 */
export const formatTime = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  return date.toLocaleTimeString('en-US');
};
