import Router from 'express';
import {createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet
} from "../controllers/Tweet.controller.js"; 
const router=Router();
 router.route("/createTweet/:userId").post(createTweet);
 router.route("/getUserTweet/:tweetId").get(getUserTweet);
 router.route("/updateTweet/:tweetId").put(updateTweet);
 router.route("/deleteTweet/:tweetId").delete(deleteTweet);
export default router;


