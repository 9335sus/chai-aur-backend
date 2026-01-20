import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

/*
=====================================================
EXPRESS APP OVERVIEW
-----------------------------------------------------
WHAT:
- Express application initialize karta hai
- Backend server ka core setup yahin hota hai
- Saare middlewares aur routes yahin register hote hain

WHY:
- Express lightweight aur fast framework hai
- Backend logic ko structured banane ke liye
- API development easy aur scalable hota hai

WHEN:
- Server start hone se pehle load hota hai
- index.js / server.js se import kiya jaata hai
=====================================================
*/

// Express application create kar rahe hain
const app = express();

/*
=====================================================
CORS MIDDLEWARE
-----------------------------------------------------
WHAT:
- Frontend aur backend ke beech communication allow karta hai
- Cross-origin requests ko handle karta hai

WHY:
- Frontend aur backend alag domain/port pe hote hain
- Cookies aur auth headers allow karne ke liye
- Security ke saath controlled access dene ke liye

WHEN:
- Har incoming request pe run hota hai
- API request process hone se pehle execute hota hai
=====================================================
*/
app.use(
  cors({
    origin: process.env.CROS_ORIGIN, // Allowed frontend URL
    credentials: true // Cookies & auth headers allow karta hai
  })
);

/*
=====================================================
JSON BODY PARSER
-----------------------------------------------------
WHAT:
- Incoming JSON request body ko parse (kisi data ko read karke uska structure 
 samajhna aur usable form me convert karna)karta hai
- Data ko req.body me available karata hai

WHY:
- APIs me JSON data commonly use hota hai
- Request data ko easily access karne ke liye

WHEN:
- POST / PUT / PATCH requests ke time
- Controller ke run hone se pehle
=====================================================
*/
app.use(express.json({ limit: "16kb" }));

/*
=====================================================
URL-ENCODED BODY PARSER
-----------------------------------------------------
WHAT:
- Form submission data ko parse karta hai
- URL-encoded payload handle karta hai

WHY:
- HTML forms ka data read karne ke liye
- Nested objects ko support karne ke liye

WHEN:
- Form-based requests ke time
- Login / signup jaise forms me
=====================================================
*/
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

/*
=====================================================
STATIC FILES MIDDLEWARE
-----------------------------------------------------
WHAT:
- Public folder ke files ko directly access allow karta hai
- Images, CSS, JS jaise assets serve karta hai

WHY:
- Static resources ko efficiently serve karne ke liye
- Repeated processing se bachne ke liye

WHEN:
- Client static file request karta hai
- Response directly Express se serve hota hai
=====================================================
*/
app.use(express.static("public"));

/*
=====================================================
COOKIE PARSER MIDDLEWARE
-----------------------------------------------------
WHAT:
- Incoming request ke cookies ko parse karta hai
- Cookies ko req.cookies me store karta hai

WHY:
- Authentication tokens (refresh token) read karne ke liye
- Cookie-based auth implement karne ke liye

WHEN:
- Har request ke time run hota hai
- Auth middleware se pehle execute hota hai
=====================================================
*/
app.use(cookieParser());

/*
=====================================================
EXPORT APP
-----------------------------------------------------
WHAT:
- Express app ko export karta hai

WHY:
- Server start file (index.js) me use karne ke liye
- Testing aur scalability ke liye

WHEN:
- Server bootstrap ke time import hota hai
=====================================================
*/

//router import

import userRouter from './routes/user.routes.js';
import commentRouter from './routes/comment.routes.js';
import videoRouter from './routes/video.routes.js';
/*
=====================================================
ROUTES DECLARATION / MOUNTING
-----------------------------------------------------
WHAT:
- User related routes ko main Express app me mount karta hai
- "/api/v1/users" base path ke saath userRouter use hota hai
- Saare user API endpoints iss path ke andar aate hain

WHY:
- API endpoints ko versioning ke sath organize karta hai (v1)
- Code modular banta hai aur routes clean rehte hain
- Future me easily naya route ya version add kar sakte hain

WHEN:
- Server setup ke time, jab app ko route handlers attach karte hain
- Jab client /api/v1/users ke endpoints pe request bhejta hai
=====================================================
*/

 
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/videos", videoRouter); // Example for video routes


export { app };
 