/*
=====================================================
DATABASE NAME CONSTANT
-----------------------------------------------------
WHAT:
- MongoDB database ka naam define karta hai
- Database connection me use hota hai
- Hardcoded string ko ek constant me rakhta hai

WHY:
- DB name ko centrally manage karne ke liye
- Typos aur mismatch errors se bachne ke liye
- Future me DB name change ho to ek hi jagah change ho

WHEN:
- Database connection establish karte time
- mongoose.connect() ke saath use hota hai
- App startup ke time indirectly use hota hai
=====================================================
*/

export const DB_NAME = "videotupe";
