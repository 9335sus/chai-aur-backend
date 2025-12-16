import { asyncHandler } from "../utils/asyncHandler.js";

/*
=====================================================
REGISTER USER CONTROLLER
-----------------------------------------------------
WHAT:
- Naya user register karne ke liye API ka controller hai
- Client se data receive karke response bhejta hai
- Filhal sirf ek test message bhej raha hai

WHY:
- User registration ke liye alag controller function banana best practice hai
- Async errors ko centralized handle karne ke liye asyncHandler use kiya hai
- Modular code likhne se maintain karna aasan hota hai

WHEN:
- Jab frontend ya Postman se POST request /api/v1/users/register pe aaye
- Signup ke time user data process karne ke liye future me logic add karenge
- Currently basic test message bhej raha hai, jise aage extend kar sakte hain
=====================================================
*/
const resisterUser = asyncHandler(async (req, res) => {
  // Response me status 200 aur message bhej rahe hain
  res.status(200).json({
    message: "chai aur code",
  });
});

export { resisterUser };
