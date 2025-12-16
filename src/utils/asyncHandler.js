/**
 * =====================================================
 * ASYNC HANDLER (Higher-Order Function)
 * =====================================================
 *
 * WHAT:
 * - asyncHandler ek higher-order function hai
 * - Ye async route handlers ko wrap karta hai
 * - Express ke liye ek safe middleware banata hai
 *
 * WHY:
 * - Express async functions ke errors automatically catch nahi karta
 * - Har controller me try-catch likhna repetitive aur messy hota hai
 * - Centralized error handling enable karta hai
 *
 * WHEN:
 * - Jab bhi async/await use kar rahe ho controllers me
 * - Especially database, API calls, auth logic ke time
 *
 * INTERVIEW:
 * - asyncHandler helps avoid repetitive try-catch blocks in Express apps.
 * =====================================================
 *
 * @param {Function} fn
 * - Actual async route handler (req, res, next)
 *
 * @returns {Function}
 * - Express-compatible middleware function
 */
const asyncHandler = (fn) => {

    /*
    -------------------------------------------------
    WHAT:
    - Ye function ek naya async middleware return karta hai
    - Express automatically ise req, res, next deta hai
    -------------------------------------------------
    */
    return async (req, res, next) => {
        try {

            /*
            ---------------------------------------------
            WHAT:
            - Original controller function execute kar rahe hain

            WHY:
            - Actual business logic isi fn ke andar hota hai

            WHEN:
            - Jab API endpoint hit hota hai
            ---------------------------------------------
            */
            await fn(req, res, next);

        } catch (err) {

            /*
            ---------------------------------------------
            WHAT:
            - Error ko catch kar rahe hain

            WHY:
            - Express async errors ko khud handle nahi karta
            - next(err) se centralized error middleware trigger hota hai

            WHEN:
            - DB error, validation error, auth error, etc.
            ---------------------------------------------
            */
            next(err);
        }
    };
};

/*
=====================================================
EXPORT
-----------------------------------------------------
WHAT:
- asyncHandler ko export kar rahe hain

WHY:
- Har controller file me reuse karne ke liye

WHEN:
- Route define karte time wrap karte hain
- Example:
  router.get("/users", asyncHandler(getUsers))
=====================================================
*/
export { asyncHandler };
