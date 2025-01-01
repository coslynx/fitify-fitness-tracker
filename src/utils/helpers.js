import DOMPurify from 'dompurify';

/**
 * Sanitizes an input string to prevent cross-site scripting (XSS) vulnerabilities.
 * Uses DOMPurify for sanitization.
 *
 * @param {string} input The string to sanitize.
 * @returns {string} The sanitized string, or an empty string if sanitization fails.
 */
export const sanitizeInput = (input) => {
    try {
        // Sanitize the input using DOMPurify
        const sanitizedInput = DOMPurify.sanitize(input);
        return sanitizedInput;
    } catch (error) {
        // Log any sanitization errors to the console
        console.error("Error sanitizing input:", error);
        // Return an empty string if sanitization fails
        return "";
    }
};

/**
 * Validates if the given email string is in a valid format.
 * Uses a regular expression for email validation.
 *
 * @param {string} email The email string to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
export const isValidEmail = (email) => {
    // Regular expression for basic email validation
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    // Test the email string against the regex
    return emailRegex.test(email);
};


/**
 * Validates if the given password string is in a valid format.
 * Uses a regular expression to enforce password criteria.
 *
 * @param {string} password The password string to validate.
 * @returns {boolean} True if the password is valid, false otherwise.
 */
export const isValidPassword = (password) => {
    // Password regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
    // Test the password string against the regex
    return passwordRegex.test(password);
};

/**
 * Formats a date string in ISO format to YYYY-MM-DD format.
 * Uses try-catch block for error handling during date parsing.
 *
 * @param {string} dateString The date string in ISO format.
 * @returns {string | null} The formatted date string in YYYY-MM-DD format, or null if parsing fails.
 */
export const formatDate = (dateString) => {
    try {
        // Attempt to parse the date string
        const date = new Date(dateString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            // Log error and return null if date is invalid
            console.error("Invalid date string:", dateString);
            return null;
        }
        // Extract year, month, and day
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        // Return formatted date string
        return `${year}-${month}-${day}`;
    } catch (error) {
        // Log any date parsing errors to the console
        console.error("Error parsing date:", error);
        // Return null if parsing fails
        return null;
    }
};

/**
 * Generates a random string of the specified length.
 * Uses crypto.randomUUID if supported, otherwise generates a random string with Math.random.
 *
 * @param {number} length The length of the random string to generate.
 * @returns {string} The generated random string.
 */
export const generateRandomString = (length) => {
    try {
      // Check if crypto.randomUUID is supported
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        // Generate a UUID and remove dashes
        const uuid = crypto.randomUUID().replace(/-/g, '');
        // If the uuid is longer than requested length, return substring, else return uuid
        return uuid.length > length ? uuid.substring(0, length) : uuid;
      } else {
          // Generate a string using Math.random if crypto.randomUUID is not supported
          let result = '';
          const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          const charactersLength = characters.length;
          for (let i = 0; i < length; i++) {
              result += characters.charAt(Math.floor(Math.random() * charactersLength));
          }
          return result;
      }
    } catch (error) {
      console.error('Error generating random string:', error);
      return '';
    }
};