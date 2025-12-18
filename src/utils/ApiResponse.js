/**
 * =====================================================
 * STANDARD API RESPONSE CLASS
 * =====================================================
 *
 * WHAT:
 * - ApiResponse ek helper / utility class hai
 * - Ye API ke success responses ko ek fixed structure deta hai
 * - Har endpoint ka response format same banata hai
 *
 * WHY:
 * - Alag-alag APIs me alag structure confusion create karta hai
 * - Frontend ko har baar response parse karna easy ho jaata hai
 * - Clean, predictable aur professional API banti hai
 *
 * WHEN:
 * - Jab bhi API successfully data return karti hai
 * - Controllers ke andar response bhejte time
 *
 * INTERVIEW:
 * - Standard response classes improve consistency and maintainability.
 * =====================================================
 */
class ApiResponse {

    /**
     * =====================================================
     * CONSTRUCTOR
     * =====================================================
     *
     * WHAT:
     * - Response ke saare important fields initialize karta hai
     * - statusCode, data, message aur success flag set karta hai
     *
     * WHY:
     * - Har response ka same shape maintain karne ke liye
     * - Frontend ke liye predictable response banana
     *
     * WHEN:
     * - Jab `new ApiResponse()` create hota hai
     * =====================================================
     *
     * @param {number} statusCode
     * - HTTP status code (200, 201, 400, 500, etc.)
     *
     * @param {*} data
     * - Actual response data (object, array, string, null)
     *
     * @param {string} message
     * - Human readable message
     * - Default "success" rakha gaya hai
     */
    constructor(statusCode, data, message = "success") {

        /*
        ---------------------------------------------
        WHAT:
        - HTTP status code assign kar rahe hain

        WHY:
        - Client ko response ka result samajhne ke liye
        ---------------------------------------------
        */
        this.statusCode = statusCode;

        /*
        ---------------------------------------------
        WHAT:
        - Response ka main data

        WHY:
        - Frontend isi data ko UI me use karta hai
        ---------------------------------------------
        */
        this.data = data;

        /*
        ---------------------------------------------
        WHAT:
        - Response message

        WHY:
        - Success / info message dikhane ke liye
        ---------------------------------------------
        */
        this.message = message;

        /*
        ---------------------------------------------
        WHAT:
        - Success flag auto-calculate ho raha hai

        WHY:
        - Frontend ko simple boolean mil jaata hai
        - 400 se niche → success true
        - 400 ya upar → success false

        INTERVIEW:
        - This avoids manual success flag handling.
        ---------------------------------------------
        */
        this.success = statusCode < 400;
    }
}

/*
=====================================================
EXPORT
-----------------------------------------------------
WHAT:
- ApiResponse class ko export kar rahe hain

WHY:
- Controllers aur services me reuse karne ke liye

WHEN:
- res.json(new ApiResponse(...)) use karte time
=====================================================
*/
export { ApiResponse};
