import Router from "express";
import { toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideo
} from "../controllers/like.controller.js";
import {verifyJWT} from "../middlewares/verifyJWT.middleware.js";

const router= Router();

router.route("/toggleVideolike/:videoId").post(verifyJWT,toggleVideoLike);
router.route("/toggleCommentlike/:commentId").post(verifyJWT,toggleCommentLike);
router.route("/toggleTweetlike/:tweetId").post(verifyJWT,toggleTweetLike);
router.route("/likedVideos").get(verifyJWT,getLikedVideo); 

export default router;