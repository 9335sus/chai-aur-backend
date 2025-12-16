/**
 * =====================================================
 * CUSTOM API ERROR CLASS
 * =====================================================
 *
 * WHAT:
 * - ApiError ek custom error class hai
 * - Ye JavaScript ki built-in Error class ko extend karti hai
 * - API responses ke liye standard error structure provide karti hai
 *
 * WHY:
 * - Normal Error object me sirf message hota hai
 * - Hume statusCode, success flag aur detailed errors bhi chahiye
 * - Centralized & consistent error handling ke liye
 *
 * WHEN:
 * - Jab bhi API me koi error aata hai (validation, auth, DB, etc.)
 * - Controllers / services ke andar throw kiya jaata hai
 *
 * INTERVIEW:
 * - Custom error classes help maintain consistent API responses.
 * =====================================================
 */
class ApiError extends Error {

    /**
     * =====================================================
     * CONSTRUCTOR FUNCTION
     * =====================================================
     *
     * WHAT:
     * - Error ke saare important details initialize karta hai
     * - Parent Error class ko message pass karta hai
     *
     * WHY:
     * - Har error ka same format chahiye frontend ke liye
     * - Debugging aur logging easy ho jaati hai
     *
     * WHEN:
     * - Jab `new ApiError()` create hota hai
     * =====================================================
     *
     * @param {number} statusCode
     * - HTTP status code (400, 401, 403, 404, 500, etc.)
     *
     * @param {string} message
     * - Error ka readable message
     * - Default diya gaya hai taaki empty na ho
     *
     * @param {Array} errors
     * - Extra error details (validation errors, field errors)
     *
     * @param {string} stack
     * - Optional custom stack trace
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        /*
        ---------------------------------------------
        WHAT:
        - Parent Error class ka constructor call karte hain
        - Error.message properly set ho jaata hai

        WHY:
        - JavaScript ka default error behavior maintain hota hai
        - Stack trace automatic generate hota hai
        ---------------------------------------------
        */
        super(message);

        /*
        ---------------------------------------------
        WHAT:
        - HTTP status code store kar rahe hain
        WHY:
        - Response ke time correct status bhejne ke liye
        WHEN:
        - Error response return karte waqt
        ---------------------------------------------
        */
        this.statusCode = statusCode;

        /*
        ---------------------------------------------
        WHAT:
        - Error ke sath koi data nahi hota
        WHY:
        - Error response me data generally null hota hai
        ---------------------------------------------
        */
        this.data = null;

        /*
        ---------------------------------------------
        WHAT:
        - Error ka main message
        WHY:
        - Frontend ko readable error dikhane ke liye
        ---------------------------------------------
        */
        this.message = message;

        /*
        ---------------------------------------------
        WHAT:
        - Success flag always false
        WHY:
        - Frontend easily check kar sake response success hai ya nahi
        ---------------------------------------------
        */
        this.success = false;

        /*
        ---------------------------------------------
        WHAT:
        - Extra error details ka array
        WHY:
        - Validation ya multiple errors handle karne ke liye
        ---------------------------------------------
        */
        this.errors = errors;

        /*
        ---------------------------------------------
        WHAT:
        - Stack trace set karna
        WHY:
        - Debugging ke time exact error location milti hai
        WHEN:
        - Development / logging phase
        ---------------------------------------------
        */
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/*
=====================================================
EXPORT
-----------------------------------------------------
WHAT:
- ApiError ko export kar rahe hain

WHY:
- Controllers, services aur middleware me reuse kar sake

WHEN:
- throw new ApiError(...) use karte time
=====================================================
*/
export { ApiError };
