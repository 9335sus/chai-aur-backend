/**
 * asyncHandler ek higher-order function hai jo async route handlers ko wrap karta hai.
 * Iska kaam hai ki agar async function me koi error aaye to use catch karke next middleware (error handler) ko bhej de.
 * Isse baar-baar try-catch likhne ki zarurat nahi padti.
 * 
 * @param {Function} fn - Async route handler function (req, res, next)
 * @returns Middleware function jo Express ke liye compatible hai.
 */
const asyncHandler = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next)
        } catch (err) {
            next(err)  // Error ko Express ke centralized error handling middleware ko forward karte hain
        }
    }
}

export { asyncHandler }
