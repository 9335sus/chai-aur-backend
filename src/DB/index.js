import mongoose from "mongoose";
import { DB_NAME } from "../constents.js";

/*
=====================================================
DATABASE CONNECTION OVERVIEW
-----------------------------------------------------
WHAT:
- MongoDB database se application ka connection establish karta hai
- Mongoose ka use karke DB connection handle karta hai
- Centralized database connection logic provide karta hai

WHY:
- Application ko database ke saath interact karne ke liye
- DB connection logic ko ek hi jagah maintain karne ke liye
- Error handling aur stability ensure karne ke liye

WHEN:
- Server start hote hi call kiya jaata hai
- App ke first boot time pe execute hota hai
- Kisi bhi DB operation se pehle required hota hai
=====================================================
*/

/*
=====================================================
connectDB FUNCTION
-----------------------------------------------------
WHAT:
- MongoDB URI aur database name ke saath mongoose.connect() call karta hai
- Successful connection par DB host ka naam print karta hai

WHY:
- DB connection success ya failure clearly pata chal sake
- Debugging aur monitoring easy ho jaati hai

WHEN:
- index.js / server.js se server start ke time call hota hai
=====================================================
*/
const connectDB = async () => {
  try {
    /*
      WHAT:
      - MongoDB se asynchronous connection establish karta hai

      WHY:
      - await use karne se ensure hota hai ki DB connect ho chuki ho
        uske baad hi server aage chale

      WHEN:
      - App startup ke time run hota hai
    */
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    /*
      WHAT:
      - Successful DB connection ka confirmation log karta hai

      WHY:
      - Developer ko pata chale ki DB kis host se connected hai

      WHEN:
      - Connection successful hone ke turant baad
    */
    console.log(
      `\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    /*
      WHAT:
      - DB connection error handle karta hai

      WHY:
      - Agar DB connect nahi hui to app ko aage chalana unsafe hai

      WHEN:
      - Connection failure ya wrong credentials ke case me
    */
    console.log("MongoDB connection error :", error);

    /*
      WHAT:
      - Node process ko terminate kar deta hai

      WHY:
      - DB ke bina backend application ka koi fayda nahi
      - Infinite error state se bachne ke liye

      WHEN:
      - Fatal DB connection failure ke time
    */
    process.exit(1);
  }
};

/*
=====================================================
EXPORT
-----------------------------------------------------
WHAT:
- connectDB function ko export karta hai

WHY:
- Server start file (index.js) me reuse ke liye

WHEN:
- Application bootstrap ke time import karke call kiya jaata hai
=====================================================
*/
export default connectDB;
