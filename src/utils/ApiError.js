/**
 * ApiError ek custom error class hai jo Error class ko extend karti hai.
 * Iska use hum API errors ko better handle karne ke liye karte hain.
 * Isme HTTP status code, error message, additional errors array, aur stack trace hota hai.
 */
class ApiError extends Error {
    /**
     * Constructor jo error details set karta hai.
     * 
     * @param {number} statusCode - HTTP status code (jaise 400, 404, 500 etc.)
     * @param {string} message - Error message (default "Something went wrong")
     * @param {Array} errors - Additional error details (default empty array)
     * @param {string} stack - Optional custom stack trace
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""  // stack trace ke liye correct spelling
    ) {
        super(message)  // Parent Error class ko message bhejte hain

        this.statusCode = statusCode  // HTTP status code set kar rahe hain
        this.data = null              // Optional data jo error ke sath bhejna ho, abhi null rakha hai
        this.message = message        // Error message set kar rahe hain
        this.success = false          // Always false because it's an error
        this.errors = errors          // Additional errors ki list assign kar rahe hain

        if (stack) {
            this.stack = stack        // Agar custom stack trace diya ho to use karenge
        } else {
            Error.captureStackTrace(this, this.constructor)  // Nahi to current stack trace generate karenge
        }
    }
}

export { ApiError }
