import { Router } from "express";
import { resisterUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
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

export default router;
