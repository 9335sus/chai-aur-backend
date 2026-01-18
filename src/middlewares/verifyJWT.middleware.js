import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

// ============================
// VERIFY JWT MIDDLEWARE
// ============================
//
// WHAT:
// - User ke access token ko verify karta hai
// - Token se user extract karta hai
// - req.user me authenticated user attach karta hai
//
// WHY:
// - Protected routes ko unauthorized access se bachane ke liye
// - Token invalid / expired hone par request block karne ke liye
//
// WHEN:
// - Jab koi protected route hit hota hai
// - Jab middleware chain me authentication required ho
// - Jab frontend Bearer token ya cookies ke sath request bheje

 const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    //  console.log("🍪 Cookies:", req.cookies);
    // console.log("📨 Auth Header:", req.header("Authorization"));
    // WHAT: Access token cookies ya Authorization header se nikal rahe hain
    // WHY: Token dono jagah se aa sakta hai (cookie / Bearer)
    // WHEN: Har protected request ke start me
    const Token =
      req.cookies?.accessToken ||
     req.header("Authorization")?.replace("Bearer ", "")

      console.log("🔑 Access Token:", Token);
    // WHAT: Access token missing check
    // WHY: Token ke bina user verify nahi ho sakta
    // WHEN: Request aate hi
    if (!Token) {
      throw new ApiError(401, "Access token missing");
    }

    // WHAT: JWT token verify kar rahe hain
    // WHY: Token valid aur tamper-free hai ya nahi check karna
    // WHEN: Token milne ke baad
    const decodedToken = jwt.verify(
      Token,
      process.env.ACCESS_TOKEN_SECRET
    );
    console.log("📦 Decoded Token:", decodedToken);
  //  console.log("SECRET USED:", process.env.ACCESS_TOKEN_SECRET);

    // WHAT: Token se user ID nikal kar DB se user fetch kar rahe hain
    // WHY: Confirm karna ki user abhi bhi system me exist karta hai
    // WHEN: Token verify hone ke baad
    const user = await User.findById(decodedToken._id)
      .select("-password -refreshToken");
       console.log("👤 User from DB:", user);
    // WHAT: User exist nahi karta to error
    // WHY: Deleted / invalid user ko access dena unsafe hai
    // WHEN: DB query ke baad
    if (!user) {
      // NOTE: Frontend ko logout ya re-login karwana chahiye
      throw new ApiError(401, "Invalid access token");
    }

    // WHAT: Authenticated user ko req object me attach kar rahe hain
    // WHY: Next controllers ko user info chahiye hoti hai
    // WHEN: User successfully verify ho jaaye
    req.user = user;

    // WHAT: Next middleware / controller ko control de rahe hain
    // WHY: Request flow continue karne ke liye
    // WHEN: Authentication successful ho
    next();

  } catch (error) {
    // WHAT: Token verify fail hone par error handle
    // WHY: Expired / malformed token ko block karna
    // WHEN: jwt.verify ya DB query fail ho
    console.log("❌ JWT VERIFY ERROR MESSAGE:", error.message);
  console.log("❌ JWT VERIFY ERROR NAME:", error.name);
    throw new ApiError(
      401,
      "Unauthorized access",
      error?.message
    );
  }
});

export { verifyJWT };
