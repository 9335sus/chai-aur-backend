import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

// Creating an Express application
const app = express()

// Setting up CORS middleware
app.use(cors({
    origin: process.env.CROS_ORIGIN,  // Specifies which domain(s) are allowed to make requests (e.g., frontend URL)
    credentials: true                 // Allows credentials (cookies, authorization headers) in cross-origin requests
}))
// CORS stands for Cross-Origin Resource Sharing
// It is required when frontend and backend are running on different domains or ports

// Body parsing middleware
app.use(express.json({ limit: "16kb" }))  
// Parses incoming requests with JSON payloads
// Size limit is applied to protect the server from very large payloads

app.use(express.urlencoded({ extended: true, limit: "16kb" }))
// Parses URL-encoded data (commonly used in form submissions)
// extended:true allows parsing of complex and nested objects

// Middleware to serve static files
app.use(express.static("public"))
// Makes files inside the "public" folder directly accessible to the client
// Useful for serving images, CSS, JavaScript files, or other static assets

// Middleware to parse cookies
app.use(cookieParser())
// Parses cookies from incoming HTTP requests and stores them in req.cookies
// Helps in easily reading and managing cookies on the backend

// Exporting the app so it can be imported and used in the server or other files
export { app }
