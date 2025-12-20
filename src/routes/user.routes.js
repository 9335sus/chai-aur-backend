import { Router } from "express";
import { resisterUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/verifyJWT.middleware.js";
import { loginUser } from "../controllers/user.controller.js";
import { logoutUser } from "../controllers/user.controller.js";
/*
=====================================================
USER ROUTES SETUP
-----------------------------------------------------
WHAT:
- User related API endpoints define karta hai
- "/resister" endpoint pe POST request handle karta hai
- Controller function resisterUser ko call karta hai

WHY:
- Routes ko alag file me organize karna code clean banata hai
- Ek jagah se saare user routes manage karna easy hota hai
- Scalability aur maintainability improve hoti hai

WHEN:
- Jab client POST request "/resister" path pe bhejta hai
- User registration ke liye ye route activate hota hai
=====================================================
*/
const router = Router();

// POST request pe /resister route ko handle karte hain
router.route("/resister").post(
    upload.fields([
        {name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    resisterUser);

// ============================
// AUTH ROUTES
// ============================

// WHAT:
// - Login route define karta hai
// - Public route hai (JWT verify nahi hota)
//
// WHY:
// - User ko authenticate karna zaruri hota hai
// - Login ke time user ke paas token nahi hota
//
// WHEN:
// - Jab user login form submit karta hai
// - Jab frontend /login API call karta hai

router.route("/login").post(loginUser);


// ============================
// SECURED ROUTES
// ============================

// WHAT:
// - Logout route define karta hai
// - JWT verified user ko hi logout karne deta hai
//
// WHY:
// - Sirf authenticated user ka hi session end hona chahiye
// - Unauthorized logout request ko block karna
//
// WHEN:
// - Jab logged-in user logout button click karta hai
// - Jab frontend /logout API call karta hai

router.route("/logout").post(verifyJWT, logoutUser);



export default router;
